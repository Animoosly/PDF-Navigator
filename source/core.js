/* Offline PDF Navigator - workbook import, grouping, and source matching. */
(function (root) {
 'use strict';
 const norm = value => String(value ?? '').trim().toLowerCase().replace(/[\s_./-]+/g, '');
 const path = value => String(value ?? '').normalize('NFC').replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '').toLowerCase();
 const base = value => String(value ?? '').replace(/\\/g, '/').split('/').pop();
 const text = (node, tag) => Array.from(node.getElementsByTagNameNS('*', tag)).map(n => n.textContent).join('');
 const aliases = {
  filename: ['originalfilename','filename','file','documentname','documentfilename','filepath','path'],
  group: ['projectlocation','project','groupname','group','location','asset','facility','system'],
  code: ['groupcode','mapcode','groupid','mapid'],
  period: ['period','year','documentyear','startyear','date','documentdate'],
  folder: ['relativefolder','folder','directory','sourcefolder'],
  type: ['drawingtype','documenttype','type'],
  status: ['areastatus','boundarystatus','districtstatus','cbwcd','inout'],
  description: ['description','documenttitle','title'],
  id: ['id','documentid','index']
 };
 function detectMapping(headers) {
  const result = {};
  for (const [field, list] of Object.entries(aliases)) {
   result[field] = -1;
   for (const alias of list) { const i = headers.findIndex(h => norm(h) === alias); if (i >= 0) { result[field] = i; break; } }
  }
  return result;
 }
 function parseXml(value, label) {
  const document = new DOMParser().parseFromString(value, 'application/xml');
  if (document.getElementsByTagName('parsererror').length) throw new Error('Cannot read ' + label + ': invalid workbook XML.');
  return document;
 }
 async function readWorkbook(file) {
  if (!/\.xlsx$/i.test(file.name)) throw new Error('Choose an .xlsx workbook. In Excel, use Save As > Excel Workbook (.xlsx).');
  if (file.size > 80 * 1024 * 1024) throw new Error('Choose an Excel workbook smaller than 80 MB.');
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  async function member(name, optional = false) {
   const part = zip.file(name);
   if (!part) { if (optional) return null; throw new Error('This workbook is missing ' + name + '. Save it again as .xlsx in Excel.'); }
   const value = await part.async('string');
   if (value.length > 60 * 1024 * 1024) throw new Error('This worksheet is too large. Export a smaller index.');
   return parseXml(value, name);
  }
  const workbook = await member('xl/workbook.xml'), relations = await member('xl/_rels/workbook.xml.rels');
  const targets = new Map(Array.from(relations.getElementsByTagNameNS('*', 'Relationship')).map(n => [n.getAttribute('Id'), n.getAttribute('Target')]));
  const sharedXml = await member('xl/sharedStrings.xml', true);
  const shared = sharedXml ? Array.from(sharedXml.getElementsByTagNameNS('*','si')).map(si => text(si, 't')) : [];
  const sheets = [];
  for (const node of Array.from(workbook.getElementsByTagNameNS('*','sheet'))) {
   const target = targets.get(node.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id') || node.getAttribute('r:id'));
   if (!target) continue;
   const pieces = (target.startsWith('/') ? target.slice(1) : 'xl/' + target).split('/'), resolved = [];
   for (const p of pieces) { if (p === '..') resolved.pop(); else if (p !== '.') resolved.push(p); }
   const sheetXml = await member(resolved.join('/'));
   const rows = [];
   for (const row of Array.from(sheetXml.getElementsByTagNameNS('*','row'))) {
    const result = [];
    for (const cell of Array.from(row.children).filter(n => n.localName === 'c')) {
     let col = 0;
     for (const char of (cell.getAttribute('r') || '').replace(/\d/g, '')) col = col * 26 + char.toUpperCase().charCodeAt(0) - 64;
     col = col ? col - 1 : result.length;
     const type = cell.getAttribute('t'), value = text(cell, 'v');
     result[col] = type === 's' ? shared[Number(value)] ?? '' : type === 'inlineStr' ? text(cell, 't') : value;
    }
    const rowNumber = Number(row.getAttribute('r') || rows.length + 1);
    if (!Number.isInteger(rowNumber) || rowNumber < 1 || rowNumber > 100000) throw new Error('Use an index with data in the first 100,000 worksheet rows.');
    rows[rowNumber - 1] = result;
   }
   let headerRow = -1, best = -1;
   rows.slice(0, 50).forEach((row, i) => { const map = detectMapping(row); const score = (map.filename >= 0 ? 20 : 0) + Object.values(map).filter(x => x >= 0).length; if (score > best) { best = score; headerRow = i; } });
   if (rows.length) sheets.push({name: node.getAttribute('name'), rows, headerRow});
  }
  if (!sheets.length) throw new Error('No worksheets with data were found in this workbook.');
  return {sheets};
 }
 function normalizeStatus(value) {
  const s = String(value || '').trim().toLowerCase();
  if (/review|uncertain|on the line|boundary/.test(s)) return 'Needs review';
  if (/^inside|^within|^included|^yes$|^in$/.test(s)) return 'Inside area';
  if (/^outside|^excluded|^no$|^out$/.test(s)) return 'Outside area';
  return 'Not set';
 }
 function yearText(value, filename) {
  const s = String(value ?? '').trim();
  if (s && /^\d{5}(?:\.\d+)?$/.test(s)) {
   const date = new Date(Date.UTC(1899, 11, 30) + Number(s) * 86400000);
   if (!Number.isNaN(date.getTime())) return String(date.getUTCFullYear());
  }
  if (/^\d{4}(?:[-–—/]\d{4})?$/.test(s)) return s.replace(/[–—/]/g, '-');
  const match = (s || filename).match(/^(\d{4})(?:\s*[-–—]\s*(\d{4})(?=[-–—\s.]|$))?/);
  return match ? match[1] + (match[2] ? '-' + match[2] : '') : s || 'Undated';
 }
 function importRows(sheet, headerIndex, mapping) {
  if (!Number.isInteger(headerIndex) || headerIndex < 0 || headerIndex >= sheet.rows.length) throw new Error('Choose the row containing your column headings.');
  if (mapping.filename < 0) throw new Error('Select the column containing the PDF filenames.');
  const rows = [], groups = [], byKey = new Map(); let ignored = 0;
  const read = (r, field) => mapping[field] >= 0 ? String(r[mapping[field]] ?? '').trim() : '';
  for (const raw of sheet.rows.slice(headerIndex + 1)) {
   if (!raw) continue;
   let filename = read(raw, 'filename');
   if (!filename) continue;
   if (!/\.pdf$/i.test(filename)) {
    if (filename.toLowerCase() === 'total' || norm(filename) === 'filename') { ignored++; continue; }
    // Some existing indexes omit the .pdf extension; retain a PDF lookup name.
    filename += '.pdf';
   }
   const groupName = read(raw, 'group') || 'Unassigned documents', suppliedCode = read(raw, 'code');
   const groupKey = suppliedCode ? 'code:' + suppliedCode.toLowerCase() : 'name:' + groupName.toLowerCase();
   if (!byKey.has(groupKey)) {
    const id = 'g' + (groups.length + 1);
    const group = {id, code: suppliedCode || 'G' + (groups.length + 1), name: groupName, subtitle: '', notes: '', x: null, y: null, image: null, hotspots:[]};
    groups.push(group); byKey.set(groupKey, id);
    if (groups.length > 2000) throw new Error('This draft supports up to 2,000 groups per project.');
   }
   let folder = read(raw,'folder');
   if (filename.includes('/') || filename.includes('\\')) { const p = filename.replace(/\\/g,'/'); if (!folder) folder = p.slice(0, p.lastIndexOf('/')); filename = base(p); }
   const groupId = byKey.get(groupKey);
   rows.push({id:'r'+(rows.length+1), label:read(raw,'id') || String(rows.length+1), filename, folder, period:yearText(read(raw,'period'),filename), type:read(raw,'type') || 'Document', description:read(raw,'description'), status:normalizeStatus(read(raw,'status')), groupId, override:null});
   if (rows.length > 20000) throw new Error('This draft supports up to 20,000 index rows per project.');
  }
  if (!rows.length) throw new Error('No PDF filenames were found below the selected headings.');
  const used = new Set();
  for (const g of groups) { if (used.has(g.code.toLowerCase())) { let n=1; while(used.has(('G'+n).toLowerCase())) n++; g.code='G'+n; } used.add(g.code.toLowerCase()); }
  return {rows, groups, ignored};
 }
 function sourceId(file, relativePath) { return JSON.stringify([path(relativePath || file.webkitRelativePath || file.name), file.size, file.lastModified]); }
 function matchSources(rows, sources) {
  const names = new Map();
  for (const source of sources) { const k = path(base(source.path)); if (!names.has(k)) names.set(k,[]); names.get(k).push(source); }
  const result = new Map();
  for (const row of rows) {
   if (row.override) { const source = sources.find(s => s.id === row.override); result.set(row.id, source ? {state:'Matched',source} : {state:'Missing',candidates:[]}); continue; }
   const candidates = names.get(path(row.filename)) || [];
   if (!candidates.length) { result.set(row.id,{state:'Missing',candidates:[]}); continue; }
   if (row.folder) {
    const target = path(row.folder + '/' + row.filename);
    const exact = candidates.filter(s => path(s.path) === target || path(s.path).endsWith('/'+target));
    if (exact.length === 1) { result.set(row.id,{state:'Matched',source:exact[0]}); continue; }
   }
   result.set(row.id, candidates.length === 1 ? {state:'Matched',source:candidates[0]} : {state:'Choose file',candidates});
  }
  return result;
 }
 function validateProject(value) {
  if (!value || value.format !== 'offline-pdf-navigator' || ![1,2].includes(value.version) || !Array.isArray(value.rows) || !Array.isArray(value.groups) || value.rows.length > 20000 || value.groups.length > 2000) throw new Error('This is not a supported PDF Navigator project.');
  value=JSON.parse(JSON.stringify(value));
  if(value.version===1){value.version=2;value.groups.forEach(g=>{g.hotspots=[];});if(value.settings?.mode==='combined')value.settings.mode='linked';}
  const isText = (s,max=20000) => typeof s === 'string' && s.length <= max;
  const validImage = image => image === null || isText(image, 40000000) && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(image);
  const ids = new Set(), codes = new Set();
  for (const g of value.groups) {
   if (!g || !['id','name','code','subtitle','notes'].every(k=>isText(g[k])) || !g.id || !g.name.trim() || !g.code.trim() || ids.has(g.id) || codes.has(g.code.toLowerCase()) || !validImage(g.image) || (g.x === null) !== (g.y === null) || ![g.x,g.y].every(p=>p === null || Number.isFinite(p) && p>=0 && p<=1)) throw new Error('The project contains an invalid group.');
   ids.add(g.id); codes.add(g.code.toLowerCase());
   if(!Array.isArray(g.hotspots)||g.hotspots.length>100||!g.hotspots.every(h=>h&&isText(h.id)&&[h.x,h.y,h.w,h.h].every(Number.isFinite)&&h.x>=0&&h.y>=0&&h.w>0&&h.h>0&&h.x+h.w<=1.000001&&h.y+h.h<=1.000001)||new Set(g.hotspots.map(h=>h.id)).size!==g.hotspots.length)throw new Error('The project contains an invalid transparent map button.');
  }
  const rowIds = new Set();
  for (const r of value.rows) {
   if (!r || !['id','label','filename','folder','period','type','description','status','groupId'].every(k=>isText(r[k])) || !/\.pdf$/i.test(r.filename) || rowIds.has(r.id) || !ids.has(r.groupId) || !['Inside area','Outside area','Needs review','Not set'].includes(r.status) || !(r.override===null || isText(r.override))) throw new Error('The project contains an invalid document.');
   rowIds.add(r.id);
  }
  if (!value.settings || !isText(value.settings.title,300) || !isText(value.settings.subtitle,500) || !['tabloid','letter'].includes(value.settings.pageSize) || !['linked','index'].includes(value.settings.mode) || !validImage(value.map)) throw new Error('The project settings are invalid.');
  return JSON.parse(JSON.stringify(value));
 }
 function safeSegment(s){let v=String(s).normalize('NFC').replace(/[<>:"|?*\u0000-\u001f]/g,'_').replace(/[. ]+$/g,'');if(!v||v==='.'||v==='..')v='_';if(/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(v))v='_'+v;return v;}
 function linkTargets(rows,sources){
  const matches=matchSources(rows,sources),targets=new Map(),used=new Set();
  for(const row of rows){const source=matches.get(row.id)?.source;if(!source||targets.has(source.id))continue;
   const parts=source.path.replace(/\\/g,'/').split('/').filter(Boolean).map(safeSegment);if(!parts.length)parts.push(safeSegment(source.file.name));
   let candidate='Documents/'+parts.join('/'),n=2;const original=candidate;
   while(used.has(candidate.toLowerCase()))candidate=original.replace(/\.pdf$/i,'')+' ('+(n++)+').pdf';
   used.add(candidate.toLowerCase());targets.set(source.id,{source,path:candidate});
  }
  return targets;
 }
 const api = {norm,path,base,aliases,detectMapping,readWorkbook,normalizeStatus,yearText,importRows,sourceId,matchSources,validateProject,safeSegment,linkTargets};
 root.NavigatorCore = api;
 if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);

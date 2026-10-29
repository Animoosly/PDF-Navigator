(function(){
 'use strict';
 const C=NavigatorCore,$=id=>document.getElementById(id),escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 $('choose-excel').parentElement.append($('attach-only'));
 function blank(){return {format:'offline-pdf-navigator',version:1,settings:{title:'Document archive',subtitle:'Map navigator and document index',pageSize:'tabloid',mode:'combined',navigation:true},map:null,groups:[],rows:[],example:false};}
 let project=blank(),sources=[],excel=null,pendingWorkbook=null,pendingExcel=null,selected=null,busy=false,dirty=false,pdfUrl=null,pdfBytes=null,pdfStale=false,pdfName='',editing=null,dragging=null;
 function message(value,error=false){$('status').textContent=value;$('status').classList.toggle('error',error);}
 function changed(){dirty=true;if(pdfUrl){pdfStale=true;$('preview-info').textContent='The project has changed. Create the PDF again to update this preview.';$('download-pdf').disabled=true;}}
 function setBusy(value){busy=value;for(const element of document.querySelectorAll('button,input,select,textarea'))element.disabled=value;if(!value)render();}
 function download(data,name,type){const url=URL.createObjectURL(new Blob([data],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
 function settingsToUi(){for(const [id,k] of [['title','title'],['subtitle','subtitle'],['page-size','pageSize'],['mode','mode']])$(id).value=project.settings[k];$('navigation').checked=project.settings.navigation;}
 function clearPreview(){if(pdfUrl)URL.revokeObjectURL(pdfUrl);pdfUrl=null;pdfBytes=null;pdfStale=false;$('pdf-preview').removeAttribute('src');$('pdf-preview').hidden=true;$('preview-empty').hidden=false;$('download-pdf').disabled=true;$('preview-info').textContent='Create a PDF to review the exact exported pages here.';}
 function renderGroups(){
  $('group-list').innerHTML=project.groups.length?project.groups.map(g=>{const rows=project.rows.filter(r=>r.groupId===g.id);return `<button class="group-button${g.id===selected?' selected':''}" data-group="${escape(g.id)}"><span class="group-code">${escape(g.code)}</span><span><span class="group-name">${escape(g.name)}</span><span class="group-meta" style="display:block">${rows.length} files · ${g.x===null?'No marker':'Marker placed'}${g.image?' · Group image':''}</span></span></button>`;}).join(''):'<div class="empty">Import an index to see your groups.</div>';
 }
 function renderEditor(){const g=project.groups.find(g=>g.id===selected);$('group-editor').hidden=!g;if(!g)return;for(const k of ['code','name','subtitle','notes'])$('group-'+k).value=g[k];$('group-error').textContent='';$('group-image-preview').hidden=!g.image;if(g.image)$('group-image-preview').src=g.image;else $('group-image-preview').removeAttribute('src');$('remove-group-image').hidden=!g.image;$('remove-marker').disabled=g.x===null;$('delete-group').hidden=project.rows.some(r=>r.groupId===g.id);}
 function renderMarkers(){
  $('markers').innerHTML=project.map?project.groups.filter(g=>g.x!==null).map(g=>`<button class="marker${g.id===selected?' selected':''}" data-marker="${escape(g.id)}" style="left:${g.x*100}%;top:${g.y*100}%" title="${escape(g.code+' - '+g.name)}" aria-label="${escape('Move marker '+g.code)}">${escape(g.code)}</button>`).join(''):'';
 }
 function renderDocuments(){
  const matches=C.matchSources(project.rows,sources),q=$('search').value.toLowerCase().trim(),filter=$('doc-filter').value;
  const rows=project.rows.filter(r=>(!q||[r.filename,r.folder,r.period,project.groups.find(g=>g.id===r.groupId)?.name].join(' ').toLowerCase().includes(q))&&(filter==='all'||filter==='unmatched'&&matches.get(r.id)?.state!=='Matched'||filter==='review'&&r.status==='Needs review'));
  $('document-table').hidden=!rows.length;$('doc-empty').hidden=!!rows.length;
  $('doc-empty').innerHTML=project.rows.length?'<strong>No matching rows</strong>Try another search or filter.':'<strong>No documents yet</strong>Choose your Excel index above.';
  $('document-rows').innerHTML=rows.slice(0,250).map(r=>{const m=matches.get(r.id),g=project.groups.find(g=>g.id===r.groupId);return `<tr><td>${escape(r.period)}</td><td class="filename">${escape(r.filename)}<div class="secondary">${escape(r.folder)}</div></td><td>${escape(g?.code)}<div class="secondary">${escape(g?.name)}</div></td><td><span class="tag${r.status==='Needs review'?' warn':''}">${escape(r.status)}</span></td><td><span class="tag ${m.state==='Matched'?'good':'warn'}">${escape(m.state)}</span>${m.source?`<div class="secondary">${escape(m.source.path)}</div>`:''}</td><td><button data-edit="${escape(r.id)}">Edit</button></td></tr>`;}).join('');
  $('doc-count').textContent=`${project.rows.length.toLocaleString()} total index rows · ${rows.length.toLocaleString()} matching rows${rows.length>250?' · First 250 shown':''}`;
 }
 function render(){
  renderGroups();renderEditor();renderMarkers();renderDocuments();
  $('example-tag').hidden=!project.example;
  $('main-map').hidden=!project.map;$('map-placeholder').hidden=!!project.map;$('map-stage').style.minHeight=project.map?'0':'300px';
  if(project.map&&$('main-map').getAttribute('src')!==project.map)$('main-map').src=project.map;
  if(!project.map)$('main-map').removeAttribute('src');
  const matches=C.matchSources(project.rows,sources),matched=[...matches.values()].filter(m=>m.state==='Matched').length;
  $('excel-info').innerHTML=project.rows.length?`<strong>${project.rows.length.toLocaleString()}</strong> index rows · <strong>${project.groups.length}</strong> groups<br>${escape(excel?.name||(project.example?'Example project':'Restored project (Excel file not attached)'))}`:'No index selected.';
  $('source-info').innerHTML=`<strong>${sources.length.toLocaleString()}</strong> source PDFs added${project.rows.length?`<br><strong>${matched.toLocaleString()}</strong> of ${project.rows.length.toLocaleString()} index rows matched${matched<project.rows.length?` · ${project.rows.length-matched} need attention`:''}`:''}`;
  $('clear-sources').hidden=!sources.length;
  $('save-project').disabled=!project.rows.length||busy;$('create').disabled=!project.rows.length||busy;$('add-group').disabled=!project.rows.length||busy;$('remap').disabled=!pendingWorkbook||busy;
  $('attach-excel').disabled=!excel||busy;$('attach-only').hidden=!project.rows.length||!!excel;$('download-pdf').disabled=!pdfBytes||pdfStale||busy;$('map-info').textContent=`${project.groups.filter(g=>g.x!==null).length} of ${project.groups.length} groups placed on the main map.`;
 }
 function switchTab(name){for(const b of document.querySelectorAll('[data-tab]'))b.classList.toggle('active',b.dataset.tab===name);for(const n of ['map','documents','preview'])$('tab-'+n).hidden=n!==name;}
 for(const b of document.querySelectorAll('[data-tab]'))b.onclick=()=>switchTab(b.dataset.tab);
 for(const [id,k]of [['title','title'],['subtitle','subtitle'],['page-size','pageSize'],['mode','mode']])$(id).addEventListener('input',()=>{project.settings[k]=$(id).value;changed();});
 $('navigation').onchange=()=>{project.settings.navigation=$('navigation').checked;changed();};$('attach-excel').onchange=changed;
 $('choose-excel').onclick=()=>$('excel-input').click();
 $('attach-only').onclick=()=>$('attach-input').click();
 $('attach-input').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;setBusy(true);try{await C.readWorkbook(file);excel={name:file.name,bytes:new Uint8Array(await file.arrayBuffer())};changed();message('Excel file attached. Your saved index, groups, and marker positions were kept.');}catch(error){message(error.message,true);}finally{setBusy(false);}};
 const fields={filename:'PDF filename (required)',group:'Project / group name',code:'Group / map code',period:'Year / period',folder:'Folder',type:'Document type',status:'Area / district status',description:'Description',id:'Document ID'};
 function mappingFields(){
  const sheet=pendingWorkbook?.sheets[Number($('sheet-select').value)];if(!sheet)return;
  const row=Math.max(0,Number($('header-row').value)-1),headers=sheet.rows[row]||[],mapping=C.detectMapping(headers);
  $('mapping-fields').innerHTML=Object.entries(fields).map(([k,label])=>`<label><span class="label">${label}</span><select id="map-${k}"><option value="-1">${k==='filename'?'Choose filename column':'Not used'}</option>${Array.from({length:Math.max(headers.length,1)},(_,i)=>`<option value="${i}"${mapping[k]===i?' selected':''}>${escape(headers[i]||'Column '+(i+1))}</option>`).join('')}</select></label>`).join('');
 }
 function showMapping(){
  $('sheet-select').innerHTML=pendingWorkbook.sheets.map((s,i)=>`<option value="${i}">${escape(s.name)}</option>`).join('');
  let idx=pendingWorkbook.sheets.findIndex(s=>s.name.toLowerCase()==='master index');if(idx<0)idx=0;$('sheet-select').value=String(idx);$('header-row').value=String(pendingWorkbook.sheets[idx].headerRow+1);mappingFields();$('mapping-error').textContent='';$('mapping-dialog').showModal();
 }
 $('excel-input').onchange=async e=>{
  const file=e.target.files[0];e.target.value='';if(!file)return;setBusy(true);message('Reading the Excel workbook…');
  try{pendingWorkbook=await C.readWorkbook(file);pendingExcel={name:file.name,bytes:new Uint8Array(await file.arrayBuffer())};setBusy(false);showMapping();message('Check the worksheet and column choices, then import the index.');}
  catch(error){message(error.message,true);setBusy(false);}
 };
 $('sheet-select').onchange=()=>{$('header-row').value=String(pendingWorkbook.sheets[Number($('sheet-select').value)].headerRow+1);mappingFields();};$('header-row').oninput=mappingFields;
 $('cancel-mapping').onclick=()=>$('mapping-dialog').close();$('remap').onclick=showMapping;
 $('apply-mapping').onclick=()=>{
  try{
   const map=Object.fromEntries(Object.keys(fields).map(k=>[k,Number($('map-'+k).value)])),sheet=pendingWorkbook.sheets[Number($('sheet-select').value)],result=C.importRows(sheet,Number($('header-row').value)-1,map);
   if(project.rows.length&&!confirm('Replace the current index, groups, and marker placements with this Excel import? Save your project first to keep the current version.'))return;
   const oldSettings=project.settings,oldMap=project.map;project={...blank(),settings:oldSettings,map:oldMap,groups:result.groups,rows:result.rows};excel=pendingExcel;selected=project.groups[0]?.id||null;
   clearPreview();changed();$('mapping-dialog').close();render();message(`Imported ${project.rows.length} documents in ${project.groups.length} groups. Add the matching PDF folder, then upload a map and place the groups.`);
  }catch(error){$('mapping-error').textContent=error.message;}
 };
 async function addSources(items){
  if(busy)return;
  if(project.example){message('Start a new project before adding real source files to the example.',true);return;}
  setBusy(true);let count=0,skipped=0;const ids=new Set(sources.map(s=>s.id));
  try{for(const entry of items){const file=entry.file||entry;if(!/\.pdf$/i.test(file.name)){skipped++;continue;}const p=entry.path||file.webkitRelativePath||file.name,id=C.sourceId(file,p);if(ids.has(id)){skipped++;continue;}sources.push({id,path:p,file});ids.add(id);count++;}changed();message(`Added ${count} PDF files.${skipped?` Skipped ${skipped} repeated or non-PDF files.`:''} Check Documents for any missing or ambiguous matches.`);}finally{setBusy(false);}
 }
 $('choose-pdfs').onclick=()=>$('pdf-input').click();$('choose-folder').onclick=()=>$('folder-input').click();
 for(const id of ['pdf-input','folder-input'])$(id).onchange=e=>{const files=Array.from(e.target.files);e.target.value='';addSources(files);};
 $('clear-sources').onclick=()=>{if(confirm('Remove all source PDF selections? Your index, groups, and maps will stay in the project.')){sources=[];changed();render();message('Source selections removed. Add the PDF folder again when ready.');}};
 async function entryFiles(entry,parent=''){
  if(entry.isFile){const file=await new Promise((resolve,reject)=>entry.file(resolve,reject));return [{file,path:parent+file.name}];}
  const result=[];if(entry.isDirectory){const reader=entry.createReader();let batch;do{batch=await new Promise((resolve,reject)=>reader.readEntries(resolve,reject));for(const child of batch)result.push(...await entryFiles(child,parent+entry.name+'/'));}while(batch.length);}return result;
 }
 document.addEventListener('dragover',e=>e.preventDefault());document.addEventListener('drop',e=>e.preventDefault());
 $('source-drop').addEventListener('drop',async e=>{
  e.preventDefault();if(busy)return;if(project.example){message('Start a new project before adding real files.',true);return;}
  const entries=Array.from(e.dataTransfer.items||[]).filter(i=>i.kind==='file').map(i=>i.webkitGetAsEntry?.());const fallback=Array.from(e.dataTransfer.files);
  if(entries.length&&entries.every(Boolean)){setBusy(true);message('Reading dropped folders…');try{const items=[];for(const entry of entries)items.push(...await entryFiles(entry));setBusy(false);await addSources(items);}catch(error){setBusy(false);message('Could not read the folder: '+error.message+'. Try Choose folder.',true);}}
  else await addSources(fallback);
 });
 async function readImage(file){
  if(file.size>40*1024*1024)throw new Error('Choose a map image smaller than 40 MB.');
  const url=URL.createObjectURL(file);
  try{const img=new Image();img.src=url;await img.decode();const scale=Math.min(1,3600/Math.max(img.naturalWidth,img.naturalHeight));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',.94);}finally{URL.revokeObjectURL(url);}
 }
 $('choose-map').onclick=()=>$('map-input').click();$('group-image-button').onclick=()=>$('group-image-input').click();
 for(const [id,isGroup]of [['map-input',false],['group-image-input',true]])$(id).onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;const groupId=selected;setBusy(true);try{const data=await readImage(file);if(isGroup){const g=project.groups.find(g=>g.id===groupId);if(g)g.image=data;}else project.map=data;changed();message(isGroup?'Group map image added. Other groups will continue using the main map.':'Main map added. Select a group and click the image to place its marker.');}catch(error){message('Could not read that image: '+error.message,true);}finally{setBusy(false);}};
 $('group-list').onclick=e=>{const button=e.target.closest('[data-group]');if(button&&!busy){if(!saveGroup(false))return;selected=button.dataset.group;renderGroups();renderEditor();renderMarkers();}};
 function saveGroup(showMessage=true){
  const g=project.groups.find(g=>g.id===selected);if(!g)return true;
  const code=$('group-code').value.trim(),name=$('group-name').value.trim();
  if(!code||!name||code.length>12||project.groups.some(o=>o.id!==g.id&&o.code.toLowerCase()===code.toLowerCase())){$('group-error').textContent='Enter a unique map code (up to 12 characters) and a group name.';return false;}
  const updated={code,name,subtitle:$('group-subtitle').value.trim(),notes:$('group-notes').value.trim()};
  if(Object.entries(updated).some(([k,v])=>g[k]!==v)){Object.assign(g,updated);changed();renderGroups();renderMarkers();renderDocuments();}
  $('group-error').textContent='';if(showMessage)message('Group details saved.');return true;
 }
 $('save-group').onclick=()=>saveGroup();
 for(const field of ['code','name','subtitle','notes'])$('group-'+field).addEventListener('change',()=>saveGroup(false));
 $('add-group').onclick=()=>{if(!saveGroup(false))return;let n=1;while(project.groups.some(g=>g.code.toLowerCase()==='g'+n))n++;const g={id:'g'+Date.now(),code:'G'+n,name:'New group',subtitle:'',notes:'',x:null,y:null,image:null};project.groups.push(g);selected=g.id;changed();render();message('New group added. Rename it, then use Documents > Edit to move documents into it.');};
 $('delete-group').onclick=()=>{if(project.rows.some(r=>r.groupId===selected))return;project.groups=project.groups.filter(g=>g.id!==selected);selected=project.groups[0]?.id||null;changed();render();};
 $('remove-marker').onclick=()=>{const g=project.groups.find(g=>g.id===selected);if(g){g.x=g.y=null;changed();render();}};
 $('remove-group-image').onclick=()=>{const g=project.groups.find(g=>g.id===selected);if(g){g.image=null;changed();renderEditor();}};
 function place(e){const g=project.groups.find(g=>g.id===selected);if(!g||!project.map)return;const r=$('map-stage').getBoundingClientRect();g.x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));g.y=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));changed();renderMarkers();renderGroups();$('remove-marker').disabled=false;}
 $('map-stage').onpointerdown=e=>{if(busy)return;const marker=e.target.closest('[data-marker]');if(marker){if(!saveGroup(false))return;selected=marker.dataset.marker;dragging=selected;renderGroups();renderEditor();renderMarkers();$('map-stage').setPointerCapture(e.pointerId);e.preventDefault();}};
 $('map-stage').onpointermove=e=>{if(dragging&&!busy)place(e);};$('map-stage').onpointerup=e=>{if(dragging){place(e);dragging=null;}};
 $('map-stage').onpointercancel=()=>{dragging=null;};$('map-stage').onclick=e=>{if(!busy&&!e.target.closest('[data-marker]'))place(e);};
 for(const id of ['search','doc-filter'])$(id).addEventListener('input',renderDocuments);
 function sourceChoices(){const q=$('source-search').value.toLowerCase(),items=sources.filter(s=>s.path.toLowerCase().includes(q));$('source-select').innerHTML=items.slice(0,300).map(s=>`<option value="${escape(s.id)}">${escape(s.path)}</option>`).join('');const r=project.rows.find(r=>r.id===editing);if(r?.override)$('source-select').value=r.override;$('source-search-info').textContent=`${items.length} matching source files${items.length>300?' (first 300 shown; narrow your search)':''}.`;}
 $('document-rows').onclick=e=>{const b=e.target.closest('[data-edit]');if(!b||busy)return;const r=project.rows.find(r=>r.id===b.dataset.edit);editing=r.id;$('edit-filename').textContent=r.filename;$('edit-group').innerHTML=project.groups.map(g=>`<option value="${escape(g.id)}">${escape(g.code+' - '+g.name)}</option>`).join('');$('edit-group').value=r.groupId;$('edit-type').value=r.type;$('edit-status').value=r.status;$('edit-period').value=r.period;$('auto-source').checked=!r.override;$('manual-source').hidden=!r.override;$('source-search').value=r.filename;sourceChoices();$('document-error').textContent='';$('document-dialog').showModal();};
 $('source-search').oninput=sourceChoices;$('auto-source').onchange=()=>{$('manual-source').hidden=$('auto-source').checked;};$('cancel-document').onclick=()=>$('document-dialog').close();
 $('save-document').onclick=()=>{const r=project.rows.find(r=>r.id===editing);if(!r)return;const override=$('auto-source').checked?null:$('source-select').value;if(!$('auto-source').checked&&!override){$('document-error').textContent='Choose a source PDF, or turn automatic matching back on.';return;}Object.assign(r,{groupId:$('edit-group').value,type:$('edit-type').value.trim()||'Document',status:$('edit-status').value,period:$('edit-period').value.trim()||'Undated',override});changed();$('document-dialog').close();render();message('Document changes saved.');};
 $('save-project').onclick=()=>{if(!saveGroup(false))return;download(JSON.stringify(project),safeName(project.settings.title)+' - project.json','application/json');dirty=false;message('Project download started. Keep the JSON file and the original source PDFs.');};
 $('open-project').onclick=()=>$('project-input').click();$('project-input').onchange=async e=>{
  const file=e.target.files[0];e.target.value='';if(!file)return;if(project.rows.length&&!confirm('Replace this project? Save the current project first if you want to keep it.'))return;
  setBusy(true);try{if(file.size>180*1024*1024)throw new Error('Project files must be smaller than 180 MB.');const value=C.validateProject(JSON.parse(await file.text()));project=value;sources=[];excel=null;pendingWorkbook=null;pendingExcel=null;selected=project.groups[0]?.id||null;clearPreview();settingsToUi();dirty=false;message('Project restored. Re-add the original PDF folder. If needed, reselect the Excel file to include it as an attachment.');}catch(error){message('Could not open the project: '+error.message,true);}finally{setBusy(false);}
 };
 function safeName(value){return String(value||'Document archive').replace(/[<>:"/\\|?*\u0000-\u001F]/g,'_').replace(/[. ]+$/,'').slice(0,140)||'Document archive';}
 $('create').onclick=async()=>{
  if(busy||!saveGroup(false))return;
  if(!project.settings.title.trim()){message('Enter a title for the PDF.',true);return;}
  setBusy(true);
  try{const snapshot=JSON.parse(JSON.stringify(project));const result=await NavigatorPDF.build(snapshot,[...sources],{excel:$('attach-excel').checked?excel:null},message);clearPreview();pdfBytes=result.bytes;pdfName=(project.example?'EXAMPLE - ':'')+safeName(project.settings.title)+(project.settings.mode==='index'?' - index-only draft':'')+'.pdf';pdfUrl=URL.createObjectURL(new Blob([pdfBytes],{type:'application/pdf'}));$('pdf-preview').src=pdfUrl;$('pdf-preview').hidden=false;$('preview-empty').hidden=true;$('download-pdf').disabled=false;$('preview-info').textContent=`${result.pages} pages · ${result.indexPages} index pages · ${result.documents} source PDFs included${project.example?' · Example data only':''}`;switchTab('preview');message('PDF created. Review the preview, then choose Download PDF.');}
  catch(error){message(error.message,true);if(/not matched/.test(error.message))switchTab('documents');}
  finally{setBusy(false);}
 };
 $('download-pdf').onclick=()=>{if(pdfBytes)download(pdfBytes,pdfName,'application/pdf');};
 $('reset').onclick=()=>{if(project.rows.length&&!confirm('Start a new project? Save this project first if you want to keep it.'))return;project=blank();sources=[];excel=null;pendingWorkbook=null;pendingExcel=null;selected=null;dirty=false;clearPreview();settingsToUi();$('search').value='';$('doc-filter').value='all';render();switchTab('map');message('New project ready. Choose your Excel file to begin.');};
 $('demo').onclick=async()=>{
  if(project.rows.length&&!confirm('Replace this project with example data? Save your current project first to keep it.'))return;
  setBusy(true);message('Preparing the example map and drawing files…');
  try{const demo=await NavigatorDemo.create();project=demo.project;sources=demo.sources;excel=null;pendingWorkbook=null;pendingExcel=null;selected=project.groups[0].id;clearPreview();settingsToUi();changed();switchTab('map');message('EXAMPLE PROJECT: The map and drawings are fictional demonstration data. Choose Create PDF to review the complete navigation.');}catch(error){message(error.message,true);}finally{setBusy(false);}
 };
 $('readme').onclick=()=>download(window.NavigatorReadme||'See README.txt in the downloaded package.','README - PDF Navigator.txt','text/plain;charset=utf-8');
 window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
 window.NavigatorApp={getProject:()=>project,getSources:()=>sources,getPdf:()=>pdfBytes};settingsToUi();render();
})();

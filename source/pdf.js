/* Map index with internal navigation and external PDF GoToR links. */
(function(root){
 'use strict';
 async function build(project, sources, options = {}, progress = ()=>{}) {
  const {PDFDocument, StandardFonts, rgb, PDFName, PDFNumber, PDFHexString,PDFString} = PDFLib;
  const C=NavigatorCore, linked=project.settings.mode==='linked';
  if (!project.rows.length) throw new Error('Import an Excel index first.');
  const matches=C.matchSources(project.rows,sources);
  const unresolved=project.rows.filter(r=>matches.get(r.id)?.state!=='Matched');
  if (linked && unresolved.length) throw new Error(`${unresolved.length} document${unresolved.length===1?' is':'s are'} not matched. Add the PDF folder or choose the correct file in Documents. For a layout review, choose Layout draft.`);
  progress('Preparing PDF layout…');
  const pdf=await PDFDocument.create(), font=await pdf.embedFont(StandardFonts.Helvetica), bold=await pdf.embedFont(StandardFonts.HelveticaBold);
  pdf.setTitle(project.settings.title); pdf.setAuthor('Offline PDF Navigator'); pdf.setSubject('Interactive map index with separate PDF file links'); pdf.setCreator('Offline PDF Navigator - draft 0.2');
  const [W,H]=project.settings.pageSize==='letter'?[792,612]:[1224,792], M=project.settings.pageSize==='letter'?20:26;
  const navy=rgb(.08,.20,.34), ink=rgb(.12,.18,.26), muted=rgb(.36,.42,.49), line=rgb(.77,.82,.87), pale=rgb(.95,.96,.98), blue=rgb(.05,.31,.67), amber=rgb(.90,.58,.08), gray=rgb(.47,.52,.58), green=rgb(.22,.42,.28);
  const pending=[], imageCache=new Map(), sourceInfo=new Map();
  const measureCanvas=document.createElement('canvas'), measureContext=measureCanvas.getContext('2d');
  const clean=value=>String(value??'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'');
  function width(value,size=9,f=font){const s=clean(value);try{return f.widthOfTextAtSize(s,size);}catch{measureContext.font=`${f===bold?'bold ':''}${size}px Arial`;return measureContext.measureText(s).width;}}
  function write(page,value,x,y,size=9,color=ink,f=font){
   const s=clean(value); if(!s)return;
   try{f.encodeText(s);page.drawText(s,{x,y,size,font:f,color});}
   catch{
    // Browser fonts preserve non-Latin labels visually; ordinary Latin text remains searchable.
    const scale=3, canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.ceil(width(s,size,f)*scale)+4);canvas.height=Math.ceil(size*1.65*scale);
    const ctx=canvas.getContext('2d');ctx.font=`${f===bold?'bold ':''}${size*scale}px Arial`;ctx.fillStyle=`rgb(${Math.round(color.red*255)},${Math.round(color.green*255)},${Math.round(color.blue*255)})`;ctx.fillText(s,1,size*1.18*scale);
    const data=canvas.toDataURL('image/png');pending.push(pdf.embedPng(data).then(image=>page.drawImage(image,{x,y:y-size*.47,width:canvas.width/scale,height:canvas.height/scale})));
   }
  }
  function fit(value,max,size=9,f=font){let s=clean(value);if(width(s,size,f)<=max)return s;while(s.length&&width(s+'…',size,f)>max)s=s.slice(0,-1);return s+'…';}
  function wrap(value,max,size=9,f=font){
   const result=[];
   for(const paragraph of clean(value).split('\n')){
    let current='';
    for(const word of paragraph.split(/\s+/)){
     if(!word)continue;
     if(width(current?current+' '+word:word,size,f)<=max){current=current?current+' '+word:word;continue;}
     if(current){result.push(current);current='';}
     let rest=word;
     while(width(rest,size,f)>max){let cut=1;while(cut<rest.length&&width(rest.slice(0,cut+1),size,f)<=max)cut++;result.push(rest.slice(0,cut));rest=rest.slice(cut);}
     current=rest;
    }
    result.push(current);
   }
   return result.length?result:[''];
  }
  function link(page,rect,target){if(!target)return;const annotation=pdf.context.obj({Type:'Annot',Subtype:'Link',Rect:rect,Border:[0,0,0],Dest:[target.ref,PDFName.of('Fit')]});page.node.addAnnot(pdf.context.register(annotation));}
  function remoteLink(page,rect,target){const spec=pdf.context.obj({Type:'Filespec',F:PDFString.of(target),UF:PDFHexString.fromText(target)});const annotation=pdf.context.obj({Type:'Annot',Subtype:'Link',Rect:rect,Border:[0,0,0],Contents:PDFHexString.fromText('Open separate PDF: '+target),A:{S:'GoToR',F:spec,D:[0,PDFName.of('Fit')],NewWindow:true}});page.node.addAnnot(pdf.context.register(annotation));}
  function rect(page,x,y,w,h,color,border){page.drawRectangle({x,y,width:w,height:h,color,borderColor:border,borderWidth:border ? 0.5 : 0});}
  function rule(page,x,y,w){page.drawLine({start:{x,y},end:{x:x+w,y},thickness:.6,color:line});}
  function button(page,label,x,y,w,target){rect(page,x,y,w,22,rgb(1,1,1),line);write(page,label,x+8,y+7,8,navy,bold);link(page,[x,y,x+w,y+22],target);}
  function groupColor(g){const rows=project.rows.filter(r=>r.groupId===g.id);if(rows.some(r=>r.status==='Needs review'))return amber;if(rows.length&&rows.every(r=>r.status==='Outside area'))return gray;return navy;}
  function badge(page,code,x,y,r=10,color=navy){page.drawCircle({x,y,size:r,color,borderColor:rgb(1,1,1),borderWidth:1.3});const size=Math.max(4,Math.min(9,(2*r-5)/Math.max(width(code,1,bold),1)));write(page,code,x-width(code,size,bold)/2,y-size*.34,size,rgb(1,1,1),bold);}
  async function image(data){if(!data)return null;if(!imageCache.has(data))imageCache.set(data,pdf.embedJpg(data));return imageCache.get(data);}
  const mainImage=await image(project.map);
  for(const group of project.groups)if(group.image)await image(group.image);
  const groups=project.groups.filter(g=>project.rows.some(r=>r.groupId===g.id));
  const main=pdf.addPage([W,H]);
  const coverCount=project.settings.pageSize==='letter'?14:22;
  const directory=[];
  const mapW=project.settings.pageSize==='letter'?210:310, gap=22, tableW=W-2*M-mapW-gap;
  const small=project.settings.pageSize==='letter'?7:8.5, tableTop=H-126, bottom=62;
  const fixed=project.settings.pageSize==='letter'?[25,40,45,65,66,28]:[30,52,62,100,90,36];
  const fileW=tableW-fixed.reduce((a,b)=>a+b,0), colWidths=[fixed[0],fixed[1],fileW,fixed[2],fixed[3],fixed[4],fixed[5]];
  const plans=[], firstGroup=new Map();
  for(const group of groups){
   const rows=project.rows.filter(r=>r.groupId===group.id).sort((a,b)=>a.period.localeCompare(b.period,undefined,{numeric:true})||a.filename.localeCompare(b.filename,undefined,{numeric:true}));
   let chunk=[], used=24;
   function push(){const plan={page:pdf.addPage([W,H]),group,rows:chunk,index:0,total:0};plans.push(plan);if(!firstGroup.has(group.id))firstGroup.set(group.id,plan.page);chunk=[];used=24;}
   for(const row of rows){
    const filenameLines=wrap(row.filename.replace(/\.pdf$/i,''),fileW-12,small);
    const height=Math.max(22,filenameLines.length*(small+3)+9);
    if(height>tableTop-bottom-24)throw new Error('A document name is too long to fit on one page: '+row.filename);
    if(chunk.length&&used+height>tableTop-bottom)push();
    chunk.push({row,filenameLines,height});used+=height;
   }
   if(chunk.length)push();
   const owned=plans.filter(p=>p.group.id===group.id);owned.forEach((p,i)=>{p.index=i;p.total=owned.length;});
  }
  const targets=linked?C.linkTargets(project.rows,sources):new Map();let checked=0;
  for(const [id,target]of targets){progress(`Checking linked PDF ${++checked} of ${targets.size}: ${target.source.file.name}`);try{const sourcePdf=await PDFDocument.load(await target.source.file.arrayBuffer());if(!sourcePdf.getPageCount())throw new Error('No pages');sourceInfo.set(id,{count:sourcePdf.getPageCount(),path:target.path});}catch(error){throw new Error('Could not open '+target.source.file.name+'. Use an unlocked, readable PDF. '+error.message);}await new Promise(resolve=>setTimeout(resolve,0));}
  async function drawMap(page,box,active=null,custom=null,clickable=true){
   rect(page,box.x,box.y,box.w,box.h,pale,line);
   const img=custom?await image(custom):mainImage;
   if(!img){write(page,fit('ADD A MAP IMAGE',box.w-30,12,bold),box.x+15,box.y+box.h/2+10,12,muted,bold);wrap('Upload a JPG, PNG, or WebP image in the app.',box.w-30,8).forEach((t,i)=>write(page,t,box.x+15,box.y+box.h/2-10-i*12,8,muted));return;}
   const scale=Math.min(box.w/img.width,box.h/img.height),w=img.width*scale,h=img.height*scale,x=box.x+(box.w-w)/2,y=box.y+(box.h-h)/2;
   page.drawImage(img,{x,y,width:w,height:h,opacity:active ? 0.82 : 1});
   if(custom)return;
   if(clickable){for(const group of groups){for(const hs of group.hotspots||[]){const annotation=pdf.context.obj({Type:'Annot',Subtype:'Link',Rect:[x+w*hs.x,y+h*(1-hs.y-hs.h),x+w*(hs.x+hs.w),y+h*(1-hs.y)],Border:[0,0,0],Contents:PDFHexString.fromText('Open group '+group.code+' - '+group.name),Dest:[firstGroup.get(group.id).ref,PDFName.of('Fit')]});page.node.addAnnot(pdf.context.register(annotation));}}}
   for(const group of groups){
    if(group.x===null||group.y===null)continue;
    if(active&&active.id!==group.id)continue;
    const r=active?11:10,px=Math.min(x+w-r,Math.max(x+r,x+w*group.x)),py=Math.min(y+h-r,Math.max(y+r,y+h*(1-group.y)));
    if(active)page.drawCircle({x:px,y:py,size:r+3,borderColor:amber,borderWidth:2});
    badge(page,group.code,px,py,r,groupColor(group));if(clickable)link(page,[px-r-3,py-r-3,px+r+3,py+r+3],firstGroup.get(group.id));
   }
  }
  progress('Drawing map and document lists…');
  const leftW=(W-2*M)*.49, rightX=M+leftW+26, rightW=W-M-rightX;
  await drawMap(main,{x:M,y:40,w:leftW,h:H-2*M-15});
  const titleSize=project.settings.pageSize==='letter'?18:24,titleLines=wrap(project.settings.title,rightW,titleSize,bold);
  let y=H-M-titleSize;
  titleLines.forEach(t=>{write(main,t,rightX,y,titleSize,navy,bold);y-=titleSize+4;});
  wrap(project.settings.subtitle,rightW,9).slice(0,2).forEach(t=>{write(main,t,rightX,y,9,muted);y-=13;});
  y-=8;rule(main,rightX,y,rightW);y-=23;
  for(const t of ['Click a map button or group name to open its document list.',linked?'File links open separate PDFs and request a new reader window.':'LAYOUT DRAFT: document file links are not included.','Keep this index beside its Documents folder. Use Map to return.']){write(main,fit(t,rightW,9),rightX,y,9,navy);y-=14;}
  y-=8;const cw=(rightW-16)/3;
  [[project.rows.length,'indexed files'],[groups.length,'groups'],[sourceInfo.size,'separate PDF files']].forEach(([n,label],i)=>{const x=rightX+i*(cw+8);rect(main,x,y-40,cw,42,pale);write(main,String(n),x+10,y-18,19,navy,bold);write(main,label,x+10,y-32,8,muted);});
  y-=58;
  const statuses=[['Inside area',green],['Needs review',amber],['Outside area',gray],['Not set',muted]];
  let sx=rightX;for(const [label,color]of statuses){const n=project.rows.filter(r=>r.status===label).length;const s=`${label}: ${n}`;write(main,s,sx,y,7.5,color);sx+=width(s,7.5)+14;}
  y-=25;write(main,'DOCUMENT GROUPS',rightX,y,8,muted,bold);y-=18;
  const available=Math.floor((y-83)/20),shown=Math.min(coverCount,Math.max(0,available));
  // Measure directory rows against fixed content bounds, independent of paper size.
  const directoryTop=H-112,directoryBottom=92;let directoryRows=[],directoryUsed=0;
  function pushDirectory(){directory.push({page:pdf.insertPage(1+directory.length,[W,H]),items:directoryRows});directoryRows=[];directoryUsed=0;}
  for(const group of groups.slice(shown)){const lines=wrap(group.name,tableW-48,10.5),height=Math.max(28,lines.length*14+10);if(height>directoryTop-directoryBottom)throw new Error('Group name is too long for the directory: '+group.code);if(directoryRows.length&&directoryUsed+height>directoryTop-directoryBottom)pushDirectory();directoryRows.push({group,lines,height});directoryUsed+=height;}if(directoryRows.length)pushDirectory();
  for(const group of groups.slice(0,shown)){
   badge(main,group.code,rightX+9,y+3,9,groupColor(group));write(main,fit(group.name,rightW-60,9),rightX+26,y,9,navy);
   const count=project.rows.filter(r=>r.groupId===group.id).length;write(main,String(count),W-M-width(count,9),y,9,navy);
   link(main,[rightX,y-6,W-M,y+14],firstGroup.get(group.id));rule(main,rightX,y-8,rightW);y-=20;
  }
  if(directory.length){button(main,'More groups >',rightX,50,105,directory[0].page);}
  else write(main,'Every group is listed above.',rightX,57,8,muted);
  const unplaced=groups.filter(g=>g.x===null&&!(g.hotspots||[]).length).length;
  write(main,fit(`${unplaced} group${unplaced===1?'':'s'} without a map button. All groups remain in the directory.`,rightW,7.5),rightX,35,7.5,muted);
  const countPages=pdf.getPageCount();
  function footer(page,label){const usable=W-2*M;rule(page,M,28,usable);write(page,fit(project.settings.title,usable*.37,7),M,16,7,muted);write(page,fit(label,usable*.39,7),M+usable*.40,16,7,muted);const i=pdf.getPages().indexOf(page)+1;const s=`Page ${i} of ${countPages}`;write(page,s,W-M-width(s,7),16,7,muted);}
  footer(main,'Map navigator');
  for(let i=0;i<directory.length;i++){
   const d=directory[i];write(d.page,'Document directory - continued',M,H-M-22,22,navy,bold);button(d.page,'< Map',W-M-65,H-M-23,65,main);
   await drawMap(d.page,{x:W-M-mapW,y:H-126-390,w:mapW,h:390});
   let yy=directoryTop;
   d.items.forEach(({group,lines,height})=>{badge(d.page,group.code,M+12,yy-14,10,groupColor(group));lines.forEach((t,k)=>write(d.page,t,M+34,yy-17-k*14,10.5,navy));link(d.page,[M,yy-height,M+tableW,yy],firstGroup.get(group.id));rule(d.page,M,yy-height,tableW);yy-=height;});
   if(i>0)button(d.page,'< Previous directory',M,44,128,directory[i-1].page);
   if(i+1<directory.length)button(d.page,'Next directory >',M+138,44,116,directory[i+1].page);
   footer(d.page,'Group directory');
  }
  for(const plan of plans){
   const {page,group}=plan, groupIndex=groups.findIndex(g=>g.id===group.id), titleMax=W-2*M-255;
   badge(page,group.code,M+16,H-M-18,16,groupColor(group));
   let headingSize=20;while(wrap(group.name,titleMax-46,headingSize,bold).length>2&&headingSize>8)headingSize--;
   const heading=wrap(group.name,titleMax-46,headingSize,bold);let yy=H-M-14;
   heading.forEach(t=>{write(page,t,M+46,yy,headingSize,navy,bold);yy-=headingSize+3;});
   const sub=group.subtitle||`${project.rows.filter(r=>r.groupId===group.id).length} files in this group`;
   write(page,fit(sub,titleMax-46,9),M+46,Math.min(yy-3,H-80),9,muted);
   const buttonsX=W-M-233;button(page,'< Map',buttonsX,H-M-24,57,main);
   if(groupIndex>0)button(page,'< Previous',buttonsX+65,H-M-24,78,firstGroup.get(groups[groupIndex-1].id));
   if(groupIndex<groups.length-1)button(page,'Next >',buttonsX+151,H-M-24,77,firstGroup.get(groups[groupIndex+1].id));
   const included=project.rows.filter(r=>r.groupId===group.id&&matches.get(r.id)?.state==='Matched').length;
   write(page,`${linked?included:0} files linked separately${plan.total>1?`  |  List ${plan.index+1} of ${plan.total}`:''}${linked?'':'  |  LAYOUT DRAFT'}`,M+46,H-105,9,linked?green:muted,bold);
   const mapBox={x:W-M-mapW,y:H-126-(project.settings.pageSize==='letter'?300:420),w:mapW,h:project.settings.pageSize==='letter'?300:420};
   await drawMap(page,mapBox,group,group.image,false);link(page,[mapBox.x,mapBox.y,mapBox.x+mapBox.w,mapBox.y+mapBox.h],main);
   write(page,'Click the locator map to return to the main map.',mapBox.x,mapBox.y-13,7,muted);
   const notes=group.notes||'';
   if(notes)write(page,'GROUP NOTES',mapBox.x,mapBox.y-38,8,muted,bold);
   const noteLines=wrap(notes,mapW,8.5);if(noteLines.length>8)throw new Error('The notes for '+group.code+' are too long for the page. Shorten them to about eight lines.');noteLines.forEach((t,i)=>write(page,t,mapBox.x,mapBox.y-54-i*12,8.5,navy));
   let top=tableTop;rect(page,M,top-24,tableW,24,rgb(.89,.92,.95));
   let xx=M;['ID','Year','File name','Folder','Document type','Area status','Pages'].forEach((label,i)=>{write(page,label,xx+5,top-15,small,muted,bold);xx+=colWidths[i];});
   top-=24;
   plan.rows.forEach(({row,filenameLines,height},rowIndex)=>{
    if(rowIndex%2===0)rect(page,M,top-height,tableW,height,pale);
    const match=matches.get(row.id),info=linked&&match?.source?sourceInfo.get(match.source.id):null;
    const values=[row.label,row.period,null,row.folder,row.type,row.status,info?String(info.count):'-'];
    let x=M;
    values.forEach((v,i)=>{
     if(i===2){filenameLines.forEach((t,k)=>write(page,t,x+5,top-14-k*(small+3),small,info?blue:ink));if(info)remoteLink(page,[x,top-height,x+colWidths[i],top],info.path);}
     else write(page,fit(v,colWidths[i]-10,small),x+5,top-14,small,i===5?(v==='Needs review'?amber:v==='Inside area'?green:muted):ink);
     x+=colWidths[i];
    });
    rule(page,M,top-height,tableW);top-=height;
   });
   if(plan.index>0){const prior=plans.find(p=>p.group.id===group.id&&p.index===plan.index-1);button(page,'< Previous list',M,36,110,prior.page);}
   if(plan.index+1<plan.total){const next=plans.find(p=>p.group.id===group.id&&p.index===plan.index+1);button(page,'Next list >',M+120,36,100,next.page);}
   footer(page,group.code+'  '+group.name);
  }
  if(options.excel){await pdf.attach(options.excel.bytes,options.excel.name,{mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',description:'Original Excel master index used to create this PDF'});write(main,'Original Excel index included in the PDF Attachments panel.',rightX,22,7,muted);}
  // A bookmark entry for the map and each group is available in common PDF readers.
  const ctx=pdf.context, outline=ctx.obj({Type:'Outlines'}),outlineRef=ctx.register(outline);
  const entries=[{name:'Map navigator',page:main},...groups.map(g=>({name:g.code+' - '+g.name,page:firstGroup.get(g.id)}))];
  const outlines=entries.map(e=>({dict:ctx.obj({Title:PDFHexString.fromText(e.name),Parent:outlineRef,Dest:[e.page.ref,PDFName.of('Fit')]}),ref:null}));
  outlines.forEach(o=>o.ref=ctx.register(o.dict));outlines.forEach((o,i)=>{if(i)o.dict.set(PDFName.of('Prev'),outlines[i-1].ref);if(i+1<outlines.length)o.dict.set(PDFName.of('Next'),outlines[i+1].ref);});
  outline.set(PDFName.of('First'),outlines[0].ref);outline.set(PDFName.of('Last'),outlines.at(-1).ref);outline.set(PDFName.of('Count'),PDFNumber.of(outlines.length));pdf.catalog.set(PDFName.of('Outlines'),outlineRef);pdf.catalog.set(PDFName.of('PageMode'),PDFName.of('UseOutlines'));
  await Promise.all(pending);progress('Saving the PDF…');
  return {bytes:await pdf.save(),pages:pdf.getPageCount(),documents:sourceInfo.size,indexPages:1+directory.length+plans.length,links:[...targets.values()]};
 }
 root.NavigatorPDF={build};
})(globalThis);

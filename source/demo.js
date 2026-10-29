(function(root){
 'use strict';
 async function create(){
  const canvas=document.createElement('canvas');canvas.width=850;canvas.height=1100;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#e7eadf';ctx.fillRect(0,0,850,1100);
  ctx.strokeStyle='#d1d6c8';ctx.lineWidth=1;for(let x=0;x<850;x+=24){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,1100);ctx.stroke();}for(let y=0;y<1100;y+=24){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(850,y);ctx.stroke();}
  const polygon=(points,color)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#7e9286';ctx.lineWidth=2;ctx.stroke();};
  polygon([[80,120],[495,100],[530,390],[410,475],[100,420]],'#c3d8ee');
  polygon([[500,110],[760,145],[770,615],[550,620],[410,470],[530,390]],'#dfc5bb');
  polygon([[95,430],[400,485],[540,630],[755,625],[765,950],[130,980]],'#c7dbc2');
  ctx.strokeStyle='#ffffff';ctx.lineWidth=12;for(const y of [210,400,620,850]){ctx.beginPath();ctx.moveTo(30,y);ctx.lineTo(815,y+40);ctx.stroke();}for(const x of [200,450,690]){ctx.beginPath();ctx.moveTo(x,60);ctx.lineTo(x+25,1010);ctx.stroke();}
  ctx.strokeStyle='#8193a5';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(620,80);ctx.bezierCurveTo(500,260,680,440,530,580);ctx.bezierCurveTo(400,730,600,900,470,1010);ctx.stroke();
  ctx.fillStyle='#4c6459';ctx.font='bold 28px Arial';ctx.fillText('North channel',115,305);ctx.fillText('East corridor',535,490);ctx.fillText('South basin',190,765);
  ctx.font='18px Arial';ctx.fillStyle='#6a7f72';ctx.fillText('West road',55,370);ctx.fillText('Central avenue',270,620);ctx.fillText('South road',485,885);
  ctx.fillStyle='#ffffff';ctx.fillRect(25,25,57,75);ctx.fillStyle='#203b50';ctx.beginPath();ctx.moveTo(53,36);ctx.lineTo(40,62);ctx.lineTo(66,62);ctx.closePath();ctx.fill();ctx.font='bold 16px Arial';ctx.fillText('N',47,86);
  ctx.fillStyle='#ffffff';ctx.fillRect(25,1018,800,58);ctx.fillStyle='#31465b';ctx.font='bold 19px Arial';ctx.fillText('EXAMPLE MAP - NOT A REAL LOCATION',43,1044);ctx.font='14px Arial';ctx.fillText('Fictional zones for template review. Replace with your own map image.',43,1065);
  const map=canvas.toDataURL('image/jpeg',.94);
  const groups=[{id:'g1',code:'A1',name:'North channel and spreading grounds',subtitle:'North corridor between West Road and Central Avenue',notes:'Example group: channel plans, profile drawings, and historic maps.',x:.30,y:.26,image:null},{id:'g2',code:'B1',name:'East corridor storm drains',subtitle:'East corridor near the main channel',notes:'Example group: one drawing is marked Needs review. Area status must be set by a person; marker placement does not classify a document.',x:.73,y:.45,image:null},{id:'g3',code:'C1',name:'South basin and outlet works',subtitle:'South basin drainage and outlet structures',notes:'Example group: a general arrangement and an outlet detail.',x:.40,y:.72,image:null},{id:'g4',code:'Z1',name:'General maps and unplaced documents',subtitle:'Documents that are not tied to one map location',notes:'This group intentionally has no map marker. It is still reachable from the cover directory and PDF bookmarks.',x:null,y:null,image:null}];
  const definitions=[['1945','North Channel','Plan and Profile','g1','Inside area','Construction plans',2],['1947','North Channel','Vicinity Map','g1','Inside area','Map / exhibit',1],['1957','East Corridor','Contour Map','g2','Inside area','Map / exhibit',1],['1958','East Corridor','Pipeline Crossing','g2','Needs review','Structure details',1],['1964','East Corridor','Junction Box Details','g2','Inside area','Structure details',1],['1949-1952','South Basin','General Arrangement','g3','Inside area','Construction plans',1],['1954','South Basin','Outlet Structure','g3','Outside area','Structure details',1],['Undated','General Archive','Regional Reference Map','g4','Not set','Reference map',1]];
  const rows=[],sources=[];
  let n=0;
  for(const [period,location,description,groupId,status,type,pages]of definitions){
   const filename=(period==='Undated'?'!Misc':period)+'-'+location+'-'+description+'.pdf',folder=groupId==='g4'?'General':'CD0'+groupId.slice(1);
   const doc=await PDFLib.PDFDocument.create(),f=await doc.embedFont(PDFLib.StandardFonts.Helvetica),b=await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
   for(let p=0;p<pages;p++){
    const page=doc.addPage([792,612]),{rgb}=PDFLib;
    page.drawText('EXAMPLE DRAWING - FOR TEMPLATE REVIEW ONLY',{x:32,y:572,size:15,font:b,color:rgb(.08,.20,.34)});
    page.drawText(location+' - '+description,{x:32,y:545,size:13,font:f});
    page.drawText('This is fictional demonstration content, not an engineering record.',{x:32,y:523,size:10,font:f,color:rgb(.40,.45,.50)});
    for(let y=110;y<480;y+=30)page.drawLine({start:{x:55,y},end:{x:737,y},thickness:.4,color:rgb(.86,.89,.91)});
    for(let x=55;x<=737;x+=31)page.drawLine({start:{x,y:110},end:{x,y:480},thickness:.4,color:rgb(.86,.89,.91)});
    page.drawLine({start:{x:90,y:180},end:{x:700,y:395},thickness:3,color:rgb(.20,.41,.62)});
    page.drawLine({start:{x:90,y:195},end:{x:700,y:410},thickness:1,color:rgb(.20,.41,.62)});
    page.drawRectangle({x:325,y:250,width:100,height:86,borderWidth:2,borderColor:rgb(.20,.41,.62)});
    page.drawText('Illustrative plan view',{x:520,y:145,size:11,font:f});
    page.drawText('Year / period: '+period+'     Sheet '+(p+1)+' of '+pages,{x:32,y:58,size:10,font:f});
    page.drawText('Replace this file with your own source PDF in a real project.',{x:32,y:38,size:9,font:f});
   }
   const bytes=await doc.save(),file=new File([bytes],filename,{type:'application/pdf',lastModified:0}),sourcePath='Example drawings/'+folder+'/'+filename,source={id:NavigatorCore.sourceId(file,sourcePath),file,path:sourcePath};
   sources.push(source);rows.push({id:'r'+(++n),label:String(n),filename,folder,period,type,description,status,groupId,override:null});
  }
  return {project:{format:'offline-pdf-navigator',version:1,example:true,map,groups,rows,settings:{title:'Example drawing archive',subtitle:'Map navigator - fictional demonstration project',pageSize:'tabloid',mode:'combined',navigation:true}},sources};
 }
 root.NavigatorDemo={create};
})(globalThis);

import C from 'clipper-lib'
import {combine,transformed,type Piece} from './compositionGeometry'
import {valid} from './outlines'
import {simplify,type Point} from './extraction'
export type Clearance={a:Point;b:Point;center:Point;widthFT:number}
export function checkSpaces(pieces:Piece[],feetPerUnit:number,minWidth:number){
 if(!Number.isFinite(feetPerUnit)||feetPerUnit<=0||!Number.isFinite(minWidth)||minWidth<=0)throw Error('Set a valid scale and minimum width.');
 const empty={markers:[] as Clearance[],warning:false};
 if(!pieces.length)return empty;
 const normalized=pieces.map(p=>{const world=transformed(p);if(world.some(r=>!valid(r)))throw Error('Invalid or crossing outline. Repair geometry before width checks.');const c=new C.Clipper(),result:any[]=[];c.AddPaths(world.map(r=>r.map(v=>({X:Math.round(v.x*1000),Y:Math.round(v.y*1000)}))),C.PolyType.ptSubject,true);c.Execute(C.ClipType.ctUnion,result,C.PolyFillType.pftEvenOdd,C.PolyFillType.pftEvenOdd);return {...p,x:0,y:0,sx:1,sy:1,rotation:0,paths:result.map(r=>r.map((v:any)=>({x:v.X/1000,y:v.Y/1000})))}});
 const rings=combine(normalized,'union').map(r=>simplify(r,.03/feetPerUnit));
 const integers=rings.map(r=>r.map(p=>({X:Math.round(p.x*1000),Y:Math.round(p.y*1000)})));
 const inside=(p:Point)=>integers.reduce((yes,r)=>yes!==(C.Clipper.PointInPolygon({X:Math.round(p.x*1000),Y:Math.round(p.y*1000)},r)!==0),false);
 const target=minWidth/feetPerUnit,edges=rings.flatMap((r,ri)=>r.map((a,i)=>{const b=r[(i+1)%r.length],len=Math.hypot(b.x-a.x,b.y-a.y);return {a,b,ri,i,len,tx:(b.x-a.x)/len,ty:(b.y-a.y)/len}})).filter(e=>e.len>1e-6);
 if(edges.length>2500)throw Error('Outline too complex for clearance screening. Reduce outline resolution.');
 const candidates:Clearance[]=[];
 for(let i=0;i<edges.length;i++)for(let j=i+1;j<edges.length;j++){
  const a=edges[i],b=edges[j];if(a.ri===b.ri&&(Math.abs(a.i-b.i)<=1||Math.abs(a.i-b.i)===rings[a.ri].length-1))continue;
  if(a.tx*b.tx+a.ty*b.ty>-.85)continue;
  if(Math.max(a.a.x,a.b.x)+target<Math.min(b.a.x,b.b.x)||Math.max(b.a.x,b.b.x)+target<Math.min(a.a.x,a.b.x)||Math.max(a.a.y,a.b.y)+target<Math.min(b.a.y,b.b.y)||Math.max(b.a.y,b.b.y)+target<Math.min(a.a.y,a.b.y))continue;
  const n=Math.max(1,Math.min(100,Math.ceil(a.len/(target/4))));
  for(let k=0;k<n;k++){
   const t=(k+.5)/n,p={x:a.a.x+(a.b.x-a.a.x)*t,y:a.a.y+(a.b.y-a.a.y)*t},u=((p.x-b.a.x)*b.tx+(p.y-b.a.y)*b.ty)/b.len;if(u<.02||u>.98)continue;
   const q={x:b.a.x+(b.b.x-b.a.x)*u,y:b.a.y+(b.b.y-b.a.y)*u},dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy);if(d<.001||d>target+1e-6)continue;
   if((-a.ty*dx+a.tx*dy)/d<.85||(b.ty*dx-b.tx*dy)/d<.85)continue;
   const center={x:(p.x+q.x)/2,y:(p.y+q.y)/2};
   if(![.2,.5,.8].every(v=>inside({x:p.x+dx*v,y:p.y+dy*v})))continue;
   // Require sustained interior along the passage, excluding isolated tips/corners.
   if(![-.5,.5].every(v=>inside({x:center.x+a.tx*target*v,y:center.y+a.ty*target*v})))continue;
   candidates.push({a:p,b:q,center,widthFT:d*feetPerUnit});
  }
 }
 const markers:Clearance[]=[];for(const c of candidates.sort((a,b)=>a.widthFT-b.widthFT)){if(markers.every(m=>Math.hypot(c.center.x-m.center.x,c.center.y-m.center.y)>target*1.5))markers.push(c);if(markers.length===12)break}
 return {markers,warning:markers.length>0}
}

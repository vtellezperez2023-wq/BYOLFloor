import C from 'clipper-lib'
import {transformed,type Piece} from './compositionGeometry'
import {valid} from './outlines'
import type {Point} from './extraction'
export type Interaction='attract'|'repel'|'collision'|'soft merge'
const inside=(p:Point,r:Point[])=>{let yes=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)yes=!yes}return yes}
const sample=(r:Point[])=>r.flatMap((a,i)=>{const b=r[(i+1)%r.length],n=Math.max(1,Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)/8));return Array.from({length:n},(_,j)=>({x:a.x+(b.x-a.x)*j/n,y:a.y+(b.y-a.y)*j/n}))})
export function interact(pieces:Piece[],mode:Interaction,radius:number,strength:number):Piece[]{
 if(pieces.length<2)throw Error('Select at least two outlines.');if(pieces.some(p=>transformed(p).some(r=>!valid(r))))throw Error('Repair invalid source geometry before interaction.');
 if(mode==='soft merge'){
  const paths=pieces.flatMap(p=>transformed(p)).map(r=>r.map(v=>({X:Math.round(v.x*1000),Y:Math.round(v.y*1000)})));const delta=radius*strength/100*1000;const co=new C.ClipperOffset(2,100);co.AddPaths(paths,C.JoinType.jtRound,C.EndType.etClosedPolygon);const grown:any[]=[];co.Execute(grown,delta);const back=new C.ClipperOffset(2,100);back.AddPaths(grown,C.JoinType.jtRound,C.EndType.etClosedPolygon);const result:any[]=[];back.Execute(result,-delta);if(!result.length)throw Error('Soft merge produced no geometry.');return [{...pieces[0],id:crypto.randomUUID(),name:'SOFT MERGE',paths:result.map(r=>r.map((v:any)=>({x:v.X/1000,y:v.Y/1000}))),x:0,y:0,rotation:0,sx:1,sy:1,sources:pieces.flatMap(p=>p.sources)}]
 }
 const worlds=pieces.map(transformed);return pieces.map((piece,index)=>{const others=worlds.filter((_,i)=>i!==index).flat();const paths=worlds[index].map(r=>sample(r).map(p=>{let best=p,dist=Infinity;for(const ring of others)for(let i=0;i<ring.length;i++){const a=ring[i],b=ring[(i+1)%ring.length],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1))),q={x:a.x+t*dx,y:a.y+t*dy},d=Math.hypot(p.x-q.x,p.y-q.y);if(d<dist){dist=d;best=q}}const contained=others.reduce((v,r)=>v!==inside(p,r),false);if(mode==='collision'&&!contained)return p;if(mode!=='collision'&&dist>=radius)return p;const amount=strength/100*(mode==='collision'?Math.min(dist+radius*.12,radius):Math.min(radius*.35,(radius-dist)*.35));const sign=mode==='attract'||contained?1:-1;const len=dist||1;return {x:p.x+sign*(best.x-p.x)/len*amount,y:p.y+sign*(best.y-p.y)/len*amount}}));if(paths.some(r=>!valid(r)))throw Error('Deformation would cross edges. Lower strength or reach.');return {...piece,paths,x:0,y:0,rotation:0,sx:1,sy:1}})
}

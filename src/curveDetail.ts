import {transformed,type Piece} from './compositionGeometry'
import {simplify,type Point} from './extraction'
import {clean,valid} from './outlines'
const cross=(a:Point,b:Point,c:Point)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x)
function ringsCross(a:Point[],b:Point[]){return a.some((p,i)=>b.some((q,j)=>{const r=a[(i+1)%a.length],s=b[(j+1)%b.length];return Math.max(p.x,r.x)>=Math.min(q.x,s.x)&&Math.max(q.x,s.x)>=Math.min(p.x,r.x)&&Math.max(p.y,r.y)>=Math.min(q.y,s.y)&&Math.max(q.y,s.y)>=Math.min(p.y,r.y)&&cross(p,r,q)*cross(p,r,s)<=0&&cross(q,s,p)*cross(q,s,r)<=0}))}
const inside=(p:Point,r:Point[])=>{let yes=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)yes=!yes}return yes}
/** Process independent copies in world coordinates, preserving objects and rings. */
export function curveDetail(pieces:Piece[],rigidity:number,roundness:number):Piece[]{
 if(!Number.isFinite(rigidity)||!Number.isFinite(roundness))throw Error('Invalid curve settings.');
 if(rigidity===0&&roundness===0)return pieces;
 return pieces.map(piece=>{const source=transformed(piece),all=source.flat();if(!all.length)throw Error(piece.name+': no outline');
 const span=Math.max(Math.max(...all.map(p=>p.x))-Math.min(...all.map(p=>p.x)),Math.max(...all.map(p=>p.y))-Math.min(...all.map(p=>p.y)));
 const tolerance=span*.08*Math.pow(Math.max(0,Math.min(100,rigidity))/100,1.4),cut=Math.max(0,Math.min(100,roundness))/100*.45;
 const paths=source.map(r=>{if(!valid(r))throw Error(piece.name+': repair the source outline first.');let result=rigidity===0?r.map(p=>({...p})):simplify(r,tolerance);
 if(result.length<3)throw Error(piece.name+': faceting is too strong. Lower rigidity.');
 if(cut>0){const base=result;result=base.flatMap((p,i)=>{const prev=base[(i+base.length-1)%base.length],next=base[(i+1)%base.length],a={x:p.x+(prev.x-p.x)*cut,y:p.y+(prev.y-p.y)*cut},b={x:p.x+(next.x-p.x)*cut,y:p.y+(next.y-p.y)*cut},steps=10;return Array.from({length:steps+1},(_,j)=>{const t=j/steps,u=1-t;return {x:u*u*a.x+2*u*t*p.x+t*t*b.x,y:u*u*a.y+2*u*t*p.y+t*t*b.y}})})}
 result=clean(result);if(result.length>10000)throw Error(piece.name+': too many curve samples. Increase rigidity before rounding.');if(!valid(result))throw Error(piece.name+': rounding crosses the outline. Lower roundness or rigidity.');return result});
 for(let i=0;i<paths.length;i++)for(let j=i+1;j<paths.length;j++)if(ringsCross(paths[i],paths[j])||inside(paths[i][0],paths[j])!==inside(source[i][0],source[j])||inside(paths[j][0],paths[i])!==inside(source[j][0],source[i]))throw Error(piece.name+': settings would change a hole or boundary. Lower rigidity or roundness.');
 return {...piece,paths,x:0,y:0,rotation:0,sx:1,sy:1}
 })
}
export const pointCount=(pieces:Piece[])=>pieces.reduce((sum,p)=>sum+p.paths.reduce((n,r)=>n+r.length,0),0)

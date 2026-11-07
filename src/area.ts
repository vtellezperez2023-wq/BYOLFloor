import C from 'clipper-lib'
import {combine,transformed,type Piece} from './compositionGeometry'
import type {Point} from './extraction'
export function signedArea(r:Point[]){return r.reduce((sum,a,i)=>{const b=r[(i+1)%r.length];return sum+a.x*b.y-b.x*a.y},0)/2}
export function footprint(pieces:Piece[]){if(!pieces.length)return 0;const normalized=pieces.map(p=>{const clip=new C.Clipper(),solution:any[]=[];clip.AddPaths(transformed(p).map(r=>r.map(v=>({X:Math.round(v.x*1000),Y:Math.round(v.y*1000)}))),C.PolyType.ptSubject,true);clip.Execute(C.ClipType.ctUnion,solution,C.PolyFillType.pftEvenOdd,C.PolyFillType.pftEvenOdd);return {...p,x:0,y:0,rotation:0,sx:1,sy:1,paths:solution.map(r=>r.map((v:any)=>({x:v.X/1000,y:v.Y/1000})))}});return Math.abs(combine(normalized,'union').reduce((sum,r)=>sum+signedArea(r),0))}
export function worldWidth(p:Piece){const points=transformed(p).flat();return Math.max(...points.map(v=>v.x))-Math.min(...points.map(v=>v.x))}

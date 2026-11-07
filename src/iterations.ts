import {transformed,type Piece} from './compositionGeometry'
import type {Point} from './extraction'
export type Iteration={id:string;name:string;createdAt:string;pieces:Piece[];feetPerUnit:number|null}
export const makeIteration=(name:string,pieces:Piece[],feetPerUnit:number|null):Iteration=>({id:crypto.randomUUID(),name:name.trim()||'Untitled iteration',createdAt:new Date().toISOString(),pieces:structuredClone(pieces),feetPerUnit})
export function iterationPaths(iteration:Iteration):Point[][]{return iteration.pieces.filter(p=>p.visible).flatMap(p=>transformed(p).map(r=>r.map(v=>({x:v.x*(iteration.feetPerUnit||1),y:v.y*(iteration.feetPerUnit||1)}))))}
export const axon=(p:Point,z:number):Point=>({x:(p.x-p.y)*Math.sqrt(3)/2,y:(p.x+p.y)*.5-z})

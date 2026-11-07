import {useSyncExternalStore} from 'react'
import type {Point} from './extraction'
export type Source={id:string;name:string;points:Point[]}
let sources:Source[]=[];const listeners=new Set<()=>void>();
export function publishSources(prefix:string,next:Source[]){sources=[...sources.filter(s=>!s.id.startsWith(prefix+'::')),...next];listeners.forEach(fn=>fn())}
export const useSources=()=>useSyncExternalStore(fn=>{listeners.add(fn);return()=>{listeners.delete(fn)}},()=>sources)
export const openComposition=()=>window.dispatchEvent(new Event('pop-composition'))

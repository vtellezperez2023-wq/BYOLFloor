import type {Point} from './extraction'
export type CurveLayer={name:string;paths:Point[][];elevation?:number}
/** AutoCAD 2000 ASCII DXF, planar closed lightweight polylines. */
export function curvesDXF(layers:CurveLayer[],units:'feet'|'unitless'){
 const safe=(name:string)=>name.replace(/[^A-Za-z0-9 _-]/g,'_').slice(0,80)||'Curves';
 const names=layers.map((l,i)=>String(i+1).padStart(2,'0')+'_'+safe(l.name)),lines:string[]=[];const pair=(code:number,value:string|number)=>{lines.push(String(code),String(value))};const num=(n:number)=>{if(!Number.isFinite(n))throw Error('Invalid curve coordinate');return Number(n.toFixed(8))};
 pair(0,'SECTION');pair(2,'HEADER');pair(9,'$ACADVER');pair(1,'AC1015');pair(9,'$INSUNITS');pair(70,units==='feet'?2:0);pair(9,'$MEASUREMENT');pair(70,0);pair(0,'ENDSEC');
 pair(0,'SECTION');pair(2,'TABLES');pair(0,'TABLE');pair(2,'LTYPE');pair(70,1);pair(0,'LTYPE');pair(100,'AcDbSymbolTableRecord');pair(100,'AcDbLinetypeTableRecord');pair(2,'CONTINUOUS');pair(70,0);pair(3,'Solid line');pair(72,65);pair(73,0);pair(40,0);pair(0,'ENDTAB');
 pair(0,'TABLE');pair(2,'LAYER');pair(70,names.length+1);['0',...names].forEach((name,i)=>{pair(0,'LAYER');pair(100,'AcDbSymbolTableRecord');pair(100,'AcDbLayerTableRecord');pair(2,name);pair(70,0);pair(62,[7,4,6,3,5,2][i%6]);pair(6,'CONTINUOUS')});pair(0,'ENDTAB');pair(0,'ENDSEC');
 pair(0,'SECTION');pair(2,'ENTITIES');let count=0;
 layers.forEach((layer,i)=>layer.paths.forEach(r=>{const points=r.filter((p,j)=>!j||p.x!==r[j-1].x||p.y!==r[j-1].y);if(points.length>1&&points[0].x===points[points.length-1].x&&points[0].y===points[points.length-1].y)points.pop();if(points.length<3)throw Error('Cannot export a contour with fewer than three vertices');pair(0,'LWPOLYLINE');pair(100,'AcDbEntity');pair(8,names[i]);pair(100,'AcDbPolyline');pair(90,points.length);pair(70,1);pair(38,num(layer.elevation||0));for(const p of points){pair(10,num(p.x));pair(20,num(-p.y))}count++}));
 if(!count)throw Error('No visible curves to export');pair(0,'ENDSEC');pair(0,'EOF');return lines.join('\r\n')+'\r\n'
}
export function downloadRhino(layers:CurveLayer[],units:'feet'|'unitless',filename:string){const text=curvesDXF(layers,units),url=URL.createObjectURL(new Blob([text],{type:'application/dxf'})),a=document.createElement('a');a.href=url;a.download=filename+'.dxf';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}

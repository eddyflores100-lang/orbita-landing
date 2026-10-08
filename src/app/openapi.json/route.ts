import {NextResponse} from 'next/server';
export const dynamic='force-static';
export function GET(){return NextResponse.json({openapi:'3.1.0',info:{title:'Órbita — estado de integración',version:'0.1.0',description:'Servicio piloto asistido. No hay endpoints de producción automática disponibles en este sitio.'},paths:{}})}

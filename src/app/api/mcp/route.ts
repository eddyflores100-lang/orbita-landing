import {NextResponse} from 'next/server';
export const dynamic='force-static';
export function GET(){return NextResponse.json({available:false,tools:[],message:'El servidor MCP de producción no está disponible en este sitio. Solicita una propuesta a contact@alicelabs.site.'})}

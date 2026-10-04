import type {Metadata} from 'next';
export const metadata:Metadata={title:'Estado de integración',robots:{index:false,follow:true}};
export default function ApiStatus(){return <main style={{maxWidth:800,margin:'60px auto',padding:24}}><h1>Órbita: piloto asistido</h1><p>No hay producción automática, almacenamiento de propiedades ni herramientas MCP disponibles en este sitio.</p><p><a href="/">Ver servicio y solicitar propuesta →</a></p></main>}

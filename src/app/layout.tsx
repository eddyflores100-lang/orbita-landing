import type {Metadata} from 'next';
import './globals.css';
const origin=process.env.NEXT_PUBLIC_APP_URL||'https://orbita.alicelabs.site';
export const metadata:Metadata={metadataBase:new URL(origin),title:{default:'Órbita | Contenido visual para tu próxima propiedad',template:'%s · Órbita'},description:'Servicio piloto de video inmobiliario y micrositios. Mira una muestra y solicita una propuesta para una propiedad, con alcance y plazo acordados.',openGraph:{title:'Órbita | Una propiedad, una historia visual',description:'Video y micrositios inmobiliarios como servicio piloto.',type:'website',images:['/orbita/demo/poster.jpg']},icons:{icon:'/icon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body style={{margin:0,background:'#141815',color:'#f7f4e9',fontFamily:'Arial, sans-serif'}}>{children}</body></html>}

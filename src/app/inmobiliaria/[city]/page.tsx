import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {cities} from '@/lib/data/orbita-data';
import {OrbitaNavbar} from '@/components/orbita-landing/OrbitaNavbar';
import {OrbitaFooter} from '@/components/orbita-landing/OrbitaFooter';
import s from '@/app/pilot.module.css';
type Props={params:Promise<{city:string}>};
export const dynamicParams=false;
export function generateStaticParams(){return cities.map(c=>({city:c.slug}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {city}=await params;const found=cities.find(c=>c.slug===city);return {title:found?`Consulta para ${found.name}`:'Ciudad',robots:{index:false,follow:true}}}
export default async function CityPage({params}:Props){const {city}=await params;const found=cities.find(c=>c.slug===city);if(!found)notFound();return <main className={s.site}><OrbitaNavbar/><section className={s.section}><p className={s.eyebrow}>CONSULTA DE PROYECTO</p><h1 style={{fontSize:40}}>Contenido para una propiedad en {found.name}</h1><p style={{margin:'25px 0'}}>Podemos evaluar tu material y la viabilidad de un encargo remoto. Esta página no acredita una oficina local, cobertura operativa ni integración con portales de {found.name}. La propuesta confirma alcance y condiciones antes de empezar.</p><a className={s.primary} href="/#consulta">Consultar disponibilidad del piloto ↗</a></section><OrbitaFooter/></main>}

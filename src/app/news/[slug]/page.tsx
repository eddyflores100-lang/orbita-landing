import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import slugs from '@/lib/data/news-slugs.json';
import News from '../page';
export const dynamicParams=false;
export const metadata:Metadata={title:'Archivo de anuncios',robots:{index:false,follow:true}};
export function generateStaticParams(){return slugs.map(slug=>({slug}))}
export default async function ArchivedNews({params}:{params:Promise<{slug:string}>}){if(!slugs.includes((await params).slug))notFound();return <News/>}

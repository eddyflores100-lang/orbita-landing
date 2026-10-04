import {NextResponse} from 'next/server';
export const dynamic='force-static';
export function GET(){const base=process.env.NEXT_PUBLIC_APP_URL||'https://orbita.alicelabs.site';return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/','/p/la-floresta-199/','/legal/privacy/','/legal/terms/','/legal/cookies/'].map(p=>`<url><loc>${base}${p}</loc></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml'}})}

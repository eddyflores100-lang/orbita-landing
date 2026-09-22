import Link from "next/link"
import { Home } from "lucide-react"

type BreadcrumbItem = {
  label: string
  href: string
}

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://orbita.alicelabs.site"

export function OrbitaBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const itemListElement = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: BASE_URL,
    },
    ...items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 2,
      name: it.label,
      item: `${BASE_URL}${it.href}`,
    })),
  ]

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="container mx-auto max-w-6xl px-4 pt-24 pb-4 text-xs text-zinc-500"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-zinc-200 transition-colors"
          >
            <Home className="h-3 w-3" />
            <span>Home</span>
          </Link>
        </li>
        {items.map((it) => (
          <li key={it.href} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="text-zinc-700">/</span>
            {it.href === "#" ? (
              <span className="text-zinc-300">{it.label}</span>
            ) : (
              <Link
                href={it.href}
                className="hover:text-zinc-200 transition-colors"
              >
                {it.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

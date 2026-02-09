import type { Metadata } from 'next'

const SITE_NAME = 'PromptStack'
const SITE_URL = 'https://promptstack.dev'
const DEFAULT_OG_IMAGE = '/og-default.png'
const TWITTER_HANDLE = '@promptstack'

type BuildMetadataParams = {
  title: string
  description: string
  path: string
  ogImage?: string | null
  noIndex?: boolean
  ogType?: 'website' | 'article' | 'profile'
  ogAuthors?: string[]
}

/**
 * Generates a consistent Next.js Metadata object for any page.
 *
 * Usage:
 *   export const metadata = buildMetadata({ title: 'Explore', description: '...', path: '/explore' })
 *   // or in generateMetadata:
 *   return buildMetadata({ title: project.title, ... })
 */
export function buildMetadata({
  title,
  description,
  path,
  ogImage,
  noIndex = false,
  ogType = 'website',
  ogAuthors,
}: BuildMetadataParams): Metadata {
  const truncatedDescription =
    description.length > 160 ? `${description.slice(0, 157)}...` : description

  // Pass ogImage=null to let opengraph-image.tsx file convention take effect.
  // Pass ogImage=undefined (default) to use the default static OG image.
  const hasImage = ogImage !== null
  const image = hasImage ? (ogImage ?? DEFAULT_OG_IMAGE) : undefined
  const canonicalUrl = `${SITE_URL}${path}`

  // For the homepage, use just the site name; for all other pages use the template
  const fullTitle =
    path === '/' ? SITE_NAME : `${title} | ${SITE_NAME}`

  return {
    title: fullTitle,
    description: truncatedDescription,
    openGraph: {
      title: fullTitle,
      description: truncatedDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: ogType,
      ...(image
        ? {
            images: [
              {
                url: image,
                width: 1200,
                height: 630,
                alt: title,
              },
            ],
          }
        : {}),
      ...(ogAuthors ? { authors: ogAuthors } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: truncatedDescription,
      ...(image ? { images: [image] } : {}),
      site: TWITTER_HANDLE,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}

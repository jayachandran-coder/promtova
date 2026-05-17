import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Promptova';
const SITE_URL = 'https://www.promptova.com';
const DEFAULT_IMAGE = '/logo.png';
const DEFAULT_DESCRIPTION =
  'Promptova — The ultimate AI prompt gallery. Discover, copy, and share the best Midjourney, Stable Diffusion, DALL-E, and ChatGPT prompts for cinematic, anime, fantasy, fashion, and more.';
const DEFAULT_KEYWORDS =
  'AI image prompts, Midjourney prompts, Stable Diffusion prompts, anime prompts, cinematic prompts, fantasy prompts, ChatGPT prompts, AI art inspiration, prompt gallery, DALL-E prompts';

const SEOMeta = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_IMAGE,
  url = SITE_URL,
  type = 'website',
  noIndex = false,
  breadcrumb = null,   // [{ name, url }]
  articleSchema = null // { headline, image, datePublished }
}) => {
  const fullTitle = title ? `${title} – ${SITE_NAME}` : `${SITE_NAME} – The AI Prompt Universe`;
  const fullImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;
  const canonicalUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`;

  // Website JSON-LD schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  // Breadcrumb JSON-LD schema
  const breadcrumbSchema = breadcrumb
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumb.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`
        }))
      }
    : null;

  // Article / ImageObject schema for prompt detail pages
  const articleSchemaFull = articleSchema
    ? {
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        name: articleSchema.headline,
        contentUrl: articleSchema.image,
        description: description,
        datePublished: articleSchema.datePublished,
        author: { '@type': 'Organization', name: SITE_NAME }
      }
    : null;

  return (
    <Helmet>
      {/* ── Primary Meta ── */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={SITE_NAME} />
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      <link rel="canonical" href={canonicalUrl} />

      {/* ── Open Graph ── */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={canonicalUrl} />

      {/* ── Twitter / X Card ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@promptova" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* ── JSON-LD Structured Data ── */}
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
      {articleSchemaFull && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchemaFull)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOMeta;

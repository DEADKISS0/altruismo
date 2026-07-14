"use client";

import { Page } from "@/types";

interface ToolStructuredDataProps {
  page: Page;
}

export function ToolStructuredData({ page }: ToolStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: page.title,
    description: page.description || "Herramienta web interactiva",
    url: `https://altruismo-web.vercel.app/es/page/${page.id}`,
    applicationCategory: "WebApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: page.average_rating > 0 ? {
      "@type": "AggregateRating",
      ratingValue: page.average_rating,
      bestRating: 5,
      ratingCount: page.comments_count || 0,
    } : undefined,
    author: page.author ? {
      "@type": "Person",
      name: page.author.name || "Anonymous",
    } : undefined,
    datePublished: page.created_at,
    isAccessibleForFree: true,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

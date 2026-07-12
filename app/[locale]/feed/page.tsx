"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/components/locale-provider";
import { PageCard } from "@/components/page-card";
import { SearchBar } from "@/components/search-bar";
import { CategoryFilter } from "@/components/category-filter";
import { PageCategory, Page } from "@/types";
import { getPages } from "@/lib/services";

export default function FeedPage() {
  const { messages } = useLocale();
  const t = messages.feed;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<PageCategory | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getPages({ category, search }).then((data) => {
      setPages(data);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, [category, search]);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-heading text-5xl md:text-6xl text-parchment mb-8">
        {t.title}
      </h1>

      <div className="space-y-6 mb-10">
        <SearchBar value={search} onChange={setSearch} />
        <CategoryFilter selected={category} onChange={setCategory} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[320px] bg-card border border-border rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : pages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <PageCard key={page.id} page={page} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-ash text-lg">{t.noResults}</p>
        </div>
      )}
    </div>
  );
}

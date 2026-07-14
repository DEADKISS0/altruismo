"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "@/components/locale-provider";
import { PageCard } from "@/components/page-card";
import { SearchBar } from "@/components/search-bar";
import { CategoryFilter } from "@/components/category-filter";
import { PageCategory, Page } from "@/types";
import { getPages } from "@/lib/services";
import { Search, FilterX, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeedClientProps {
  initialPages: Page[];
}

export function FeedClient({ initialPages }: FeedClientProps) {
  const { messages } = useLocale();
  const t = messages.feed;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<PageCategory | null>(null);
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      getPages({ category, search }).then(setPages).catch(() => {});
      return;
    }
    setHasSearched(true);
    setIsLoading(true);
    getPages({ category, search }).then((data) => {
      setPages(data);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, [category, search]);

  const clearFilters = () => {
    setSearch("");
    setCategory(null);
    setHasSearched(false);
  };

  return (
    <div className="container mx-auto px-4 py-12 fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-5xl md:text-6xl text-parchment">
          {t.title}
        </h1>
        {(search || category) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-ash hover:text-ember gap-1"
          >
            <FilterX className="h-4 w-4" />
            {messages.feed.clearFilters}
          </Button>
        )}
      </div>

      <div className="space-y-6 mb-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ash" />
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <CategoryFilter selected={category} onChange={setCategory} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[340px] bg-card border border-border rounded-xl animate-pulse skeleton-shimmer"
            />
          ))}
        </div>
      ) : pages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page, index) => (
            <div key={page.id} className="fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <PageCard page={page} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 fade-in slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-pitch/50 border border-border mb-6">
            {hasSearched ? (
              <Search className="h-10 w-10 text-ash" />
            ) : (
              <Sparkles className="h-10 w-10 text-ember" />
            )}
          </div>
          <h3 className="font-heading text-2xl text-parchment mb-2">
            {hasSearched ? t.noResults : t.noTools}
          </h3>
          <p className="text-ash mb-6 max-w-md mx-auto">
            {hasSearched
              ? t.noResultsDesc
              : t.noToolsDesc}
          </p>
          {hasSearched && (
            <Button variant="outline" onClick={clearFilters} className="gap-2">
              <FilterX className="h-4 w-4" />
              {messages.feed.clearFilters}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
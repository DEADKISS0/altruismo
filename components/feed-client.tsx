"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useLocale } from "@/components/locale-provider";
import { PageCard } from "@/components/page-card";
import { SearchBar } from "@/components/search-bar";
import { CategoryFilter } from "@/components/category-filter";
import { PageCategory, Page } from "@/types";
import { getPages } from "@/lib/services";
import { Search, FilterX, Sparkles, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ITEMS_PER_PAGE = 9;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "rating">("recent");

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      getPages({ category, search }).then(setPages).catch(() => {});
      return;
    }
    setHasSearched(true);
    setIsLoading(true);
    setCurrentPage(1);
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
    setCurrentPage(1);
  };

  const sortedPages = useMemo(() => {
    const sorted = [...pages];
    switch (sortBy) {
      case "popular":
        return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
      case "rating":
        return sorted.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
      case "recent":
      default:
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [pages, sortBy]);

  const totalPages = Math.ceil(sortedPages.length / ITEMS_PER_PAGE);
  const paginatedPages = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedPages.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedPages, currentPage]);

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
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ash" />
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v as typeof sortBy); setCurrentPage(1); }}>
            <SelectTrigger className="w-[180px] bg-pitch border-border text-parchment">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-pitch border-border">
              <SelectItem value="recent" className="text-parchment">Más recientes</SelectItem>
              <SelectItem value="popular" className="text-parchment">Más populares</SelectItem>
              <SelectItem value="rating" className="text-parchment">Mejor valorados</SelectItem>
            </SelectContent>
          </Select>
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
      ) : paginatedPages.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedPages.map((page, index) => (
              <div key={page.id} className="fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                <PageCard page={page} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-border text-parchment"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={currentPage === pageNum ? "bg-ember text-parchment" : "border-border text-parchment"}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="border-border text-parchment"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
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
"use client";

import { useState, useEffect } from "react";
import { Page } from "@/types";
import { PageViewer } from "@/components/page-viewer";
import { Skeleton } from "@/components/ui/skeleton";

interface PageViewerClientProps {
  id: string;
  initialPage: Page | null;
}

export function PageViewerClient({ id, initialPage }: PageViewerClientProps) {
  const [page, setPage] = useState<Page | null>(initialPage);
  const [loading, setLoading] = useState(!initialPage);

  useEffect(() => {
    if (!initialPage) {
      fetch(`/api/page-debug/${id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.found && data.page) {
            const p = data.page;
            setPage({
              id: p.id,
              author_id: p.author_id,
              title: p.title,
              description: p.description,
              category: null,
              file_url: p.file_url || "",
              is_open_source: p.is_open_source || false,
              source_code: p.source_code || null,
              views: p.views || 0,
              average_rating: Number(p.average_rating) || 0,
              created_at: p.created_at,
              tags: [],
            });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id, initialPage]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-ash text-lg">Página no encontrada.</p>
      </div>
    );
  }

  return <PageViewer page={page} />;
}

"use client";

import { useState, useEffect } from "react";
import { Page } from "@/types";
import { getPage } from "@/lib/services";
import { PageViewer } from "@/components/page-viewer";
import { Skeleton } from "@/components/ui/skeleton";

interface PageViewerClientProps {
  id: string;
}

export function PageViewerClient({ id }: PageViewerClientProps) {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPage(id).then((p) => {
      setPage(p || null);
      setLoading(false);
    });
  }, [id]);

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

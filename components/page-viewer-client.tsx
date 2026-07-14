"use client";

import { useState } from "react";
import { Page } from "@/types";
import { PageViewer } from "@/components/page-viewer";
import { Skeleton } from "@/components/ui/skeleton";

interface PageViewerClientProps {
  id: string;
  initialPage: Page | null;
  initialChallenges?: any[];
}

export function PageViewerClient({ id, initialPage, initialChallenges = [] }: PageViewerClientProps) {
  const [page] = useState<Page | null>(initialPage);

  if (!page) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return <PageViewer page={page} challenges={initialChallenges} />;
}

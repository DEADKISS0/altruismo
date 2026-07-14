import { PageViewerClient } from "@/components/page-viewer-client";
import { PageParams } from "@/types";

export default async function PageDetailPage({ params }: PageParams) {
  const { id } = await params;
  return <PageViewerClient id={id} />;
}

import { notFound } from "next/navigation";
import { PageViewer } from "@/components/page-viewer";
import { getPage } from "@/lib/services";
import { PageParams } from "@/types";

export default async function PageDetailPage({ params }: PageParams) {
  const { id } = await params;
  const page = await getPage(id);

  if (!page) {
    notFound();
  }

  return (<PageViewer page={page} />);
}

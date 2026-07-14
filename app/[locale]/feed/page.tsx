import { FeedClient } from "@/components/feed-client";
import { getPages } from "@/lib/services/server";
import { LocaleParams } from "@/types";

export default async function FeedPage({ params }: LocaleParams) {
  await params; // consume locale for future i18n use
  const initialPages = await getPages();

  return <FeedClient initialPages={initialPages} />;
}

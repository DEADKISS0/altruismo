import { notFound } from "next/navigation";
import { ProfileClient } from "@/components/profile-client";
import { getUser, getPages } from "@/lib/services";
import { ProfileParams } from "@/types";

export default async function ProfilePage({ params }: ProfileParams) {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) {
    notFound();
  }

  const pages = await getPages({ authorId: id });

  return (<ProfileClient user={user} pages={pages} />);
}

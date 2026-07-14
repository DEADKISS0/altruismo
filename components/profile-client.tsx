"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/components/locale-provider";
import { useAuth } from "@/components/auth-provider";
import { User, Page } from "@/types";
import { PageCard } from "@/components/page-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, FileCode, Wrench } from "lucide-react";
import { getPages } from "@/lib/services";

interface ProfileClientProps {
  user: User;
  pages: Page[];
}

export function ProfileClient({ user, pages: initialPages }: ProfileClientProps) {
  const { messages } = useLocale();
  const { user: currentUser } = useAuth();
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [activeTab, setActiveTab] = useState("published");

  const isOwnProfile = currentUser?.id === user.id;
  const openSourcePages = pages.filter((p) => p.is_open_source);

  useEffect(() => {
    getPages({ authorId: user.id }).then(setPages);
  }, [user.id]);

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="bg-card border-border mb-10">
        <CardContent className="p-6 md:p-10">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarImage src={user.avatar_url || ""} alt={user.name || "User avatar"} />
              <AvatarFallback className="bg-void text-parchment text-4xl">
                {user.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-heading text-4xl md:text-5xl text-parchment">
                  {user.name}
                </h1>
                <Badge variant="outline" className="border-ember/30 text-ember">
                  {messages.roles[user.role] || user.role}
                </Badge>
              </div>
              <p className="text-ash text-lg">{user.bio}</p>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-parchment">
                  <Trophy className="h-5 w-5 text-ember" />
                  <span className="font-bold">{user.points.toLocaleString()}</span>
                  <span className="text-ash">{messages.leaderboard.points}</span>
                </div>
                <div className="flex items-center gap-2 text-parchment">
                  <Users className="h-5 w-5 text-ember" />
                  <span className="font-bold">{user.followers_count}</span>
                  <span className="text-ash">{messages.profile.followers}</span>
                </div>
                <div className="flex items-center gap-2 text-parchment">
                  <FileCode className="h-5 w-5 text-ember" />
                  <span className="font-bold">{pages.length}</span>
                  <span className="text-ash">{messages.profile.pages}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${isOwnProfile ? "grid-cols-2" : "grid-cols-1"}`}>
          <TabsTrigger value="published" className="data-[state=active]:bg-ember data-[state=active]:text-parchment">
            {messages.profile.publishedPages}
          </TabsTrigger>
          {isOwnProfile && (
            <TabsTrigger value="tools" className="data-[state=active]:bg-ember data-[state=active]:text-parchment">
              <Wrench className="mr-2 h-4 w-4" />
              {messages.profile.myTools}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="published" className="mt-6">
          {pages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.map((page) => (
                <PageCard key={page.id} page={page} />
              ))}
            </div>
          ) : (
            <p className="text-ash">{messages.profile.noPages}</p>
          )}
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="tools" className="mt-6">
            {openSourcePages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {openSourcePages.map((page) => (
                  <PageCard key={page.id} page={page} />
                ))}
              </div>
            ) : (
              <p className="text-ash">{messages.profile.noTools}</p>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

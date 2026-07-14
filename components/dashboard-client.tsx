"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "@/components/locale-provider";
import { useAuth } from "@/components/auth-provider";
import { User, Page } from "@/types";
import { PageCard } from "@/components/page-card";
import { UploadForm } from "@/components/upload-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getPages } from "@/lib/services";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FileCode, Eye, MessageSquare, Star, Upload, Trash2, LogOut } from "lucide-react";
import { toast } from "sonner";

interface DashboardClientProps {
  user: User;
  pages: Page[];
  locale: string;
}

export function DashboardClient({ user, pages: initialPages, locale }: DashboardClientProps) {
  const { messages } = useLocale();
  const { user: authUser, signOut } = useAuth();
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [activeTab, setActiveTab] = useState("tools");
  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authUser?.id === user.id) {
      getPages({ authorId: user.id }).then(setPages);
    }
  }, [user.id, authUser?.id]);

  const isOwnProfile = authUser?.id === user.id;

  const confirmDeletePage = async (pageId: string) => {
    try {
      const res = await fetch(`/${locale}/api/pages/${pageId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setPages(pages.filter((p) => p.id !== pageId));
      toast.success(messages.dashboard.deleted);
    } catch {
      toast.error(messages.common.error);
    }
  };

  const handleUploadSuccess = () => {
    getPages({ authorId: user.id }).then(setPages);
    setActiveTab("tools");
    toast.success(messages.dashboard.published);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ name, bio } as never)
        .eq("id", user.id);
      if (error) throw error;
      toast.success(messages.dashboard.saved);
    } catch {
      toast.error(messages.common.error);
    } finally {
      setSaving(false);
    }
  };

  const totalViews = pages.reduce((sum, p) => sum + p.views, 0);
  const avgRating = pages.length > 0 
    ? (pages.reduce((sum, p) => sum + p.average_rating, 0) / pages.length).toFixed(1)
    : "0";
  const totalComments = pages.reduce((sum, p) => sum + (p.comments_count || 0), 0);
  const openSourceCount = pages.filter(p => p.is_open_source).length;

  if (!isOwnProfile) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-ash text-lg">{messages.dashboard.notAuthorized}</p>
        <Link href={`/${locale}/profile/${user.id}`} className="text-ember hover:underline mt-4 inline-block">
          {messages.dashboard.viewPublicProfile}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="font-heading text-5xl md:text-6xl text-parchment mb-2">
          {messages.dashboard.title}
        </h1>
        <p className="text-ash">{messages.dashboard.subtitle}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-pitch border border-border">
          <TabsTrigger value="tools" className="data-[state=active]:bg-ember data-[state=active]:text-parchment">
            {messages.dashboard.tabs.tools}
          </TabsTrigger>
          <TabsTrigger value="upload" className="data-[state=active]:bg-ember data-[state=active]:text-parchment">
            {messages.dashboard.tabs.upload}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-ember data-[state=active]:text-parchment">
            {messages.dashboard.tabs.analytics}
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-ember data-[state=active]:text-parchment">
            {messages.dashboard.tabs.settings}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-3xl text-parchment">{messages.dashboard.myTools}</h2>
            <Link href={`/${locale}/upload`}>
              <Button className="bg-ember text-parchment hover:bg-ember/90">
                <Upload className="mr-2 h-4 w-4" />
                {messages.dashboard.newTool}
              </Button>
            </Link>
          </div>

          {pages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.map((page) => (
                <div key={page.id} className="relative group">
                  <PageCard page={page} />
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Link href={`/${locale}/page/${page.id}`} className="p-2 bg-pitch/90 border border-border rounded-lg hover:bg-void transition-colors" title={messages.dashboard.view}>
                      <Eye className="h-4 w-4 text-parchment" />
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <button
                            className="p-2 bg-pitch/90 border border-border rounded-lg hover:bg-void transition-colors text-ember"
                            title={messages.dashboard.delete}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        }
                      />
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{messages.dashboard.deleteConfirmTitle}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {messages.dashboard.deleteConfirmDesc}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{messages.common.cancel}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => confirmDeletePage(page.id)} className="bg-ember text-parchment hover:bg-ember/90">
                            {messages.dashboard.delete}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <FileCode className="h-16 w-16 text-ash mx-auto mb-4" />
              <h3 className="font-heading text-2xl text-parchment mb-2">{messages.dashboard.noTools}</h3>
              <p className="text-ash mb-6">{messages.dashboard.noToolsDesc}</p>
              <Link href={`/${locale}/upload`}>
                <Button className="bg-ember text-parchment hover:bg-ember/90">
                  <Upload className="mr-2 h-4 w-4" />
                  {messages.dashboard.createFirst}
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <h2 className="font-heading text-3xl text-parchment">{messages.dashboard.batchUpload}</h2>
          <p className="text-ash">{messages.dashboard.batchUploadDesc}</p>
          <UploadForm onSuccess={handleUploadSuccess} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <h2 className="font-heading text-3xl text-parchment">{messages.dashboard.analytics}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-ash text-sm">{messages.dashboard.totalViews}</p>
                    <p className="font-heading text-4xl text-parchment font-bold">{totalViews.toLocaleString()}</p>
                  </div>
                  <div className="bg-ember/20 p-4 rounded-xl">
                    <Eye className="h-8 w-8 text-ember" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-ash text-sm">{messages.dashboard.avgRating}</p>
                    <p className="font-heading text-4xl text-parchment font-bold">{avgRating} / 5</p>
                  </div>
                  <div className="bg-emerald-500/20 p-4 rounded-xl">
                    <Star className="h-8 w-8 text-emerald-500 fill-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-ash text-sm">{messages.dashboard.totalComments}</p>
                    <p className="font-heading text-4xl text-parchment font-bold">{totalComments.toLocaleString()}</p>
                  </div>
                  <div className="bg-violet-500/20 p-4 rounded-xl">
                    <MessageSquare className="h-8 w-8 text-violet-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-ash text-sm">{messages.dashboard.openSource}</p>
                    <p className="font-heading text-4xl text-parchment font-bold">{openSourceCount} / {pages.length}</p>
                  </div>
                  <div className="bg-cyan-500/20 p-4 rounded-xl">
                    <FileCode className="h-8 w-8 text-cyan-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-parchment">{messages.dashboard.toolsTable}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-ash">
                      <th className="pb-3 font-medium">{messages.dashboard.tool}</th>
                      <th className="pb-3 font-medium">{messages.dashboard.category}</th>
                      <th className="pb-3 font-medium text-right">{messages.dashboard.views}</th>
                      <th className="pb-3 font-medium text-right">{messages.dashboard.rating}</th>
                      <th className="pb-3 font-medium text-right">{messages.dashboard.comments}</th>
                      <th className="pb-3 font-medium">{messages.dashboard.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map((page) => (
                      <tr key={page.id} className="border-b border-border/50 hover:bg-void/50 transition-colors">
                        <td className="py-4">
                          <Link href={`/${locale}/page/${page.id}`} className="font-medium text-parchment hover:text-ember">
                            {page.title}
                          </Link>
                        </td>
                        <td className="py-4">
                          <Badge variant="outline" className="border-ember/30 text-ember">
                            {messages.feed.categories[page.category as keyof typeof messages.feed.categories] || page.category}
                          </Badge>
                        </td>
                        <td className="py-4 text-right text-parchment">{page.views.toLocaleString()}</td>
                        <td className="py-4 text-right">
                          <span className="flex items-center justify-end gap-1 text-parchment">
                            <Star className="h-4 w-4 fill-ember text-ember" />
                            {page.average_rating.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-4 text-right text-parchment">{page.comments_count || 0}</td>
                        <td className="py-4">
                          <Badge variant={page.is_open_source ? "default" : "secondary"} className="bg-ember/20 text-ember border-ember/30">
                            {page.is_open_source ? messages.dashboard.openSource : messages.dashboard.private}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <h2 className="font-heading text-3xl text-parchment">{messages.dashboard.settings}</h2>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-parchment">{messages.dashboard.profile}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatar_url || ""} alt={user.name || "Avatar"} />
                  <AvatarFallback className="bg-ember text-parchment text-2xl">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="font-heading text-2xl text-parchment">{user.name}</h3>
                  <p className="text-ash">{user.email}</p>
                  <Badge variant="outline" className="border-ember/30 text-ember">
                    {messages.roles[user.role] || user.role}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border">
                <div>
                  <p className="text-ash text-sm">{messages.dashboard.points}</p>
                  <p className="font-heading text-3xl text-parchment font-bold">{user.points.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-ash text-sm">{messages.dashboard.level}</p>
                  <p className="font-heading text-3xl text-parchment font-bold">{user.level}</p>
                </div>
                <div>
                  <p className="text-ash text-sm">{messages.dashboard.followers}</p>
                  <p className="font-heading text-3xl text-parchment font-bold">{(user.followers_count ?? 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-parchment">{messages.dashboard.editProfile}</CardTitle>
            </CardHeader>
<CardContent className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-parchment">{messages.dashboard.name}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-pitch border-border text-parchment"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-parchment">{messages.dashboard.bio}</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="bg-pitch border-border text-parchment min-h-[100px]"
                  />
                </div>
                <Button
                  className="bg-ember text-parchment hover:bg-ember/90"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? messages.common.loading : messages.dashboard.saveChanges}
                </Button>
                <p className="text-ash text-sm">{messages.dashboard.saveChangesNote}</p>
              </CardContent>
          </Card>

          <Card className="bg-card border-border border-destructive/50">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-destructive">{messages.dashboard.dangerZone}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-parchment">{messages.dashboard.deleteAccount}</p>
                  <p className="text-ash text-sm">{messages.dashboard.deleteAccountDesc}</p>
                </div>
                <Button variant="destructive" className="border-destructive text-destructive hover:bg-destructive/10">
                  {messages.dashboard.deleteAccount}
                </Button>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <p className="font-medium text-parchment">{messages.dashboard.signOut}</p>
                  <p className="text-ash text-sm">{messages.dashboard.signOutDesc}</p>
                </div>
                <Button variant="outline" onClick={signOut} className="border-parchment/20 text-parchment hover:bg-void">
                  <LogOut className="mr-2 h-4 w-4" />
                  {messages.nav.logout}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
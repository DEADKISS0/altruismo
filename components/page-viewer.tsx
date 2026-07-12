"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Page } from "@/types";
import { useLocale } from "@/components/locale-provider";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Star,
  Code2,
  ExternalLink,
  MessageSquare,
  Eye,
  UserPlus,
  UserMinus,
} from "lucide-react";
import {
  isFollowing,
  followUser,
  unfollowUser,
  createComment,
  submitFeedback,
} from "@/lib/services";
import { toast } from "sonner";

interface PageViewerProps {
  page: Page;
}

export function PageViewer({ page }: PageViewerProps) {
  const { messages, locale } = useLocale();
  const { user } = useAuth();
  const t = messages.page;
  const [following, setFollowing] = useState(false);
  const isOwnPage = user?.id === page.author_id;

  useEffect(() => {
    if (!isOwnPage) {
      isFollowing(page.author_id).then(setFollowing);
    }
  }, [page.author_id, isOwnPage]);
  const [comments, setComments] = useState(page.comments_count || 0);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(0);
  const [activeTab, setActiveTab] = useState<"tool" | "comments" | "source">("tool");

  const handleFollow = async () => {
    if (!user) return;
    try {
      if (following) {
        await unfollowUser(page.author_id);
        setFollowing(false);
      } else {
        await followUser(page.author_id);
        setFollowing(true);
      }
    } catch {
      toast.error(messages.common.error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await createComment({ page_id: page.id, content: newComment });
      setComments((c) => c + 1);
      setNewComment("");
      toast.success(messages.page.commentSubmit);
    } catch {
      toast.error(messages.common.error);
    }
  };

  const handleRating = async (value: number) => {
    try {
      setRating(value);
      await submitFeedback({ page_id: page.id, rating: value });
      toast.success(messages.page.rating);
    } catch {
      toast.error(messages.common.error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeTab === "tool" ? "default" : "outline"}
              onClick={() => setActiveTab("tool")}
              className={activeTab === "tool" ? "bg-ember text-parchment" : ""}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {t.useTool}
            </Button>
            {page.is_open_source && (
              <Button
                variant={activeTab === "source" ? "default" : "outline"}
                onClick={() => setActiveTab("source")}
                className={activeTab === "source" ? "bg-ember text-parchment" : ""}
              >
                <Code2 className="mr-2 h-4 w-4" />
                {t.source}
              </Button>
            )}
            <Button
              variant={activeTab === "comments" ? "default" : "outline"}
              onClick={() => setActiveTab("comments")}
              className={activeTab === "comments" ? "bg-ember text-parchment" : ""}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              {t.comments} ({comments})
            </Button>
          </div>

          {activeTab === "tool" && (
            <Card className="bg-card border-border overflow-hidden">
              <CardContent className="p-0">
                <iframe
                  src={page.file_url}
                  className="w-full h-[600px] border-0"
                  sandbox="allow-scripts allow-same-origin"
                  title={page.title}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === "source" && page.source_code && (
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <pre className="bg-pitch p-4 rounded-lg overflow-auto text-sm font-mono text-parchment">
                  <code>{page.source_code}</code>
                </pre>
              </CardContent>
            </Card>
          )}

          {activeTab === "comments" && (
            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-heading text-2xl text-parchment">{t.comments}</h3>
                {user ? (
                  <form onSubmit={handleComment} className="space-y-2">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={messages.page.commentPlaceholder}
                      className="bg-pitch border-border text-parchment"
                    />
                    <Button type="submit" className="bg-ember text-parchment">
                      {messages.page.commentSubmit}
                    </Button>
                  </form>
                ) : (
                  <p className="text-ash">{messages.page.signInToComment}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-ember/30 text-ember">
                  {page.category}
                </Badge>
                <div className="flex items-center gap-1 text-ash">
                  <Eye className="h-4 w-4" />
                  {page.views}
                </div>
              </div>
              <h1 className="font-heading text-4xl text-parchment">{page.title}</h1>
              <p className="text-ash">{page.description}</p>
              <div className="flex items-center gap-3 pt-2">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={page.author?.avatar_url || ""} alt={page.author?.name || "Author avatar"} />
                  <AvatarFallback className="bg-void text-parchment">
                    {page.author?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Link
                    href={`/${locale}/profile/${page.author_id}`}
                    className="font-medium text-parchment hover:text-ember"
                  >
                    {page.author?.name}
                  </Link>
                  <p className="text-xs text-ash">{page.author?.bio}</p>
                </div>
              </div>
              <Button
                onClick={handleFollow}
                variant="outline"
                className="w-full border-parchment/20 text-parchment hover:bg-void"
                disabled={isOwnPage}
              >
                {isOwnPage ? (
                  <>
                    {messages.page.yourPage}
                  </>
                ) : following ? (
                  <>
                    <UserMinus className="mr-2 h-4 w-4" />
                    {t.unfollow}
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t.follow}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-heading text-2xl text-parchment">{t.rating}</h3>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleRating(value)}
                    aria-label={`${value} ${locale === "es" ? "estrellas" : "stars"}`}
                    className="text-ember hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        value <= rating ? "fill-ember" : "fill-transparent"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-ash">
                {page.average_rating.toFixed(1)} / 5 ({page.comments_count} {messages.page.comments})
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

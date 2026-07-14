"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Page, Comment } from "@/types";
import { useLocale } from "@/components/locale-provider";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Star,
  Code2,
  ExternalLink,
  MessageSquare,
  Eye,
  UserPlus,
  UserMinus,
  Heart,
  Maximize2,
  Share2,
  Link as LinkIcon,
  Bookmark,
  BookmarkCheck,
  Trophy,
} from "lucide-react";
import {
  isFollowing,
  followUser,
  unfollowUser,
  createComment,
  getComments,
  submitFeedback,
  getPageLikes,
  isPageLiked,
  togglePageLike,
  incrementPageViews,
} from "@/lib/services";
import { toast } from "sonner";

interface Challenge {
  id: string;
  page_id: string;
  title: string;
  description: string | null;
  duration_days: number | null;
  goal_type: string | null;
  goal_value: number | null;
  reward_text: string | null;
  is_active: boolean | null;
}

interface PageViewerProps {
  page: Page;
  challenges?: Challenge[];
}

function CommentItem({
  comment,
  pageId,
  onReply,
  depth = 0,
}: {
  comment: Comment;
  pageId: string;
  onReply: (parentId: string) => void;
  depth?: number;
}) {
  const { locale, messages } = useLocale();
  const { user } = useAuth();
  const [replies, setReplies] = useState<Comment[]>([]);

  useEffect(() => {
    getComments(pageId).then((all) => {
      setReplies(all.filter((c) => c.parent_id === comment.id));
    });
  }, [pageId, comment.id]);

  return (
    <div className={`${depth > 0 ? "ml-8 border-l border-border pl-4" : ""}`}>
      <div className="flex gap-3 py-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user?.avatar_url || ""} alt={comment.user?.name || ""} />
          <AvatarFallback className="bg-void text-parchment text-xs">
            {comment.user?.name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/${locale}/profile/${comment.user_id}`}
              className="text-sm font-medium text-parchment hover:text-ember"
            >
              {comment.user?.name}
            </Link>
            <span className="text-xs text-ash">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-ash mt-1">{comment.content}</p>
          {user && (
            <button
              onClick={() => onReply(comment.id)}
              className="text-xs text-ember hover:underline mt-1"
            >
              {messages.page.reply}
            </button>
          )}
        </div>
      </div>
      {replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          pageId={pageId}
          onReply={onReply}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export function PageViewer({ page, challenges = [] }: PageViewerProps) {
  const { messages, locale } = useLocale();
  const { user } = useAuth();
  const t = messages.page;
  const [following, setFollowing] = useState<boolean | null>(null);
  const isOwnPage = user?.id === page.author_id;
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState(page.comments_count || 0);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [activeTab, setActiveTab] = useState<"tool" | "comments" | "source" | "challenges">("tool");
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [toolError, setToolError] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const toolHtml = useMemo(() => {
    if (page.source_code && page.source_code.length > 0) return page.source_code;
    return null;
  }, [page.source_code]);

  const toolUrl = useMemo(() => {
    if (page.file_url && page.file_url.length > 0) return page.file_url;
    return null;
  }, [page.file_url]);

  useEffect(() => {
    if (!isOwnPage) {
      isFollowing(page.author_id).then(setFollowing);
    }
    getComments(page.id).then(setComments);
    getPageLikes(page.id).then(setLikes);
    isPageLiked(page.id).then(setLiked);
    incrementPageViews(page.id).catch(() => {});
    // Check bookmark from localStorage
    try {
      const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
      setIsBookmarked(bookmarks.includes(page.id));
    } catch {}
  }, [page.author_id, page.id, isOwnPage]);

  const handleFollow = async () => {
    if (!user || following === null) return;
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

  const handleShare = async (platform: string) => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `${page.title} — ${page.description || ""}`;
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(messages.page.linkCopied || "Enlace copiado");
    } catch {
      toast.error(messages.common.error);
    }
  };

  const handleBookmark = () => {
    try {
      const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
      if (isBookmarked) {
        const updated = bookmarks.filter((id: string) => id !== page.id);
        localStorage.setItem("bookmarks", JSON.stringify(updated));
        setIsBookmarked(false);
        toast.success(messages.page.bookmarkRemoved || "Eliminado de favoritos");
      } else {
        bookmarks.push(page.id);
        localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
        setIsBookmarked(true);
        toast.success(messages.page.bookmarkAdded || "Añadido a favoritos");
      }
    } catch {}
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await createComment({ page_id: page.id, content: newComment, parent_id: replyTo });
      setCommentsCount((c) => c + 1);
      setNewComment("");
      setReplyTo(null);
      getComments(page.id).then(setComments);
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

  const handleLike = async () => {
    if (!user) {
      toast.error(messages.nav.login);
      return;
    }
    try {
      const next = await togglePageLike(page.id);
      setLiked(next);
      setLikes((prev) => (next ? prev + 1 : Math.max(prev - 1, 0)));
    } catch {
      toast.error(messages.common.error);
    }
  };

  const topLevelComments = comments.filter((c) => c.parent_id === null);

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
                  {t.comments} ({commentsCount})
                </Button>
                {challenges.length > 0 && (
                  <Button
                    variant={activeTab === "challenges" ? "default" : "outline"}
                    onClick={() => setActiveTab("challenges")}
                    className={activeTab === "challenges" ? "bg-ember text-parchment" : ""}
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    Retos ({challenges.length})
                  </Button>
                )}
              </div>

          {activeTab === "tool" && (
            <Card className="bg-card border-border overflow-hidden relative">
              <CardContent className="p-0">
                {!toolUrl && !toolHtml ? (
                  <div className="w-full h-[600px] flex items-center justify-center text-ash flex-col gap-4">
                    <p>{messages.page.error}</p>
                    <p className="text-sm">El desarrollador no incluyó el archivo fuente.</p>
                  </div>
                ) : (
                  <iframe
                    src={toolUrl || undefined}
                    width="100%"
                    height="600px"
                    style={{ border: "none", backgroundColor: "#000000", overflow: "hidden" }}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={page.title}
                  />
                )}
              </CardContent>
              {toolUrl && (
              <div className="absolute top-3 right-3 flex gap-2 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-pitch/90 border border-border rounded-lg hover:bg-void transition-colors"
                  onClick={() => window.open(toolUrl, "_blank")}
                  title="Abrir en nueva pestaña"
                >
                  <ExternalLink className="h-4 w-4 text-parchment" />
                </Button>
                <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
                  <DialogTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-pitch/90 border border-border rounded-lg hover:bg-void transition-colors"
                        title="Pantalla completa"
                      >
                        <Maximize2 className="h-4 w-4 text-parchment" />
                      </Button>
                    }
                  />
                  <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
                    <iframe
                      src={toolUrl}
                      style={{ width: "95vw", height: "90vh", border: "none", borderRadius: "8px", backgroundColor: "#000000" }}
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={page.title}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              )}
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
                    {replyTo && (
                      <div className="text-sm text-ash">
                        {messages.page.replyingTo}{" "}
                        <button
                          type="button"
                          onClick={() => setReplyTo(null)}
                          className="text-ember hover:underline"
                        >
                          ({messages.page.cancelReply})
                        </button>
                      </div>
                    )}
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
                <div className="divide-y divide-border">
                  {topLevelComments.length > 0 ? (
                    topLevelComments.map((comment) => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        pageId={page.id}
                        onReply={setReplyTo}
                      />
                    ))
                  ) : (
                    <p className="text-ash py-4">
                      {messages.page.noComments}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "challenges" && challenges.length > 0 && (
            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-heading text-2xl text-parchment">Retos de esta herramienta</h3>
                <p className="text-ash">Completá estos retos usando la herramienta y ganá puntos.</p>
                <div className="space-y-4">
                  {challenges.map((challenge) => (
                    <div key={challenge.id} className="p-4 bg-void border border-border rounded-lg">
                      <h4 className="font-heading text-lg text-parchment mb-2">{challenge.title}</h4>
                      <p className="text-ash mb-3">{challenge.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-ash">
                        {challenge.duration_days && (
                          <span>⏱ {challenge.duration_days} días</span>
                        )}
                        {challenge.goal_value && (
                          <span>🎯 {challenge.goal_value} usos</span>
                        )}
                        {challenge.reward_text && (
                          <span className="text-ember">🏆 {challenge.reward_text}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-ember/30 text-ember">
                  {page.category || "Sin categoría"}
                </Badge>
                <div className="flex items-center gap-3 text-ash">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1 transition-colors ${liked ? "text-ember" : "hover:text-ember"}`}
                    aria-label={liked ? "Quitar me gusta" : "Me gusta"}
                  >
                    <Heart className={`h-4 w-4 ${liked ? "fill-ember" : ""}`} />
                    <span>{likes}</span>
                  </button>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {page.views}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleCopyLink}
                    className="p-2 rounded-lg bg-void hover:bg-pitch text-ash hover:text-parchment transition-colors"
                    aria-label="Copiar enlace"
                    title="Copiar enlace"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleBookmark}
                    className={`p-2 rounded-lg transition-colors ${
                      isBookmarked
                        ? "bg-ember/10 text-ember"
                        : "bg-void hover:bg-pitch text-ash hover:text-parchment"
                    }`}
                    aria-label={isBookmarked ? "Quitar de favoritos" : "Añadir a favoritos"}
                    title={isBookmarked ? "Quitar de favoritos" : "Guardar"}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="h-4 w-4" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </button>
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
                disabled={isOwnPage || following === null}
              >
                {isOwnPage ? (
                  <>{messages.page.yourPage}</>
                ) : following === null ? (
                  <span className="h-4" />
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
                {page.average_rating.toFixed(1)} / 5 ({commentsCount} {messages.page.comments})
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { Page, User, Challenge, Comment, ChallengeParticipant, PageCategory, Tag, Achievement } from "@/types";

const PAGES_BUCKET = "pages";

function mapUser(row: any): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name || row.email,
    avatar_url: row.avatar_url,
    bio: row.bio,
    role: row.role as User["role"],
    points: row.points,
    level: row.level,
    followers_count: row.followers_count,
    following_count: row.following_count,
    created_at: row.created_at,
  };
}

async function getCategoryIdBySlug(supabase: any, slug: string | null): Promise<string | null> {
  if (!slug) return null;
  const { data } = await supabase.from("categories").select("id").eq("slug", slug).single();
  return data?.id || null;
}

function mapPage(row: any): Page {
  const author = row.author ? mapUser(row.author) : undefined;
  const tags = row.page_tags
    ? row.page_tags.map((pt: any) => ({ id: pt.tag?.id || pt.tag_id, name: pt.tag?.name || "" })).filter((t: Tag) => t.name)
    : row.tags || [];
  return {
    id: row.id,
    author_id: row.author_id,
    author,
    title: row.title,
    description: row.description || null,
    category: (row.category_slug || row.categories?.slug) as PageCategory | null,
    file_url: row.file_url,
    is_open_source: row.is_open_source,
    source_code: row.source_code || null,
    views: row.views || 0,
    average_rating: Number(row.average_rating) || 0,
    created_at: row.created_at,
    comments_count: row.comments_count || 0,
    is_featured: row.is_featured || false,
    tags,
  };
}

export function createService(supabase: any) {
  async function getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    return profile ? mapUser(profile) : null;
  }

  async function getUser(id: string): Promise<User | undefined> {
    const { data } = await supabase.from("profiles").select("*").eq("id", id).single();
    return data ? mapUser(data) : undefined;
  }

  async function getUsers(): Promise<User[]> {
    const { data } = await supabase.from("profiles").select("*");
    return (data || []).map(mapUser);
  }

  async function getPages(params?: {
    category?: PageCategory | null;
    search?: string;
    authorId?: string;
  }): Promise<Page[]> {
    let query = supabase
      .from("pages")
      .select("*, author:profiles(*), categories(slug), page_tags(tag:tags(*))")
      .order("created_at", { ascending: false });

    if (params?.category) {
      const categoryId = await getCategoryIdBySlug(supabase, params.category);
      if (categoryId) query = query.eq("category_id", categoryId);
    }
    if (params?.authorId) {
      query = query.eq("author_id", params.authorId);
    }
    if (params?.search) {
      query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((row: any) =>
      mapPage({ ...row, category_slug: row.categories?.slug, page_tags: row.page_tags })
    );
  }

  async function getPage(id: string): Promise<Page | undefined> {
    const { data } = await supabase
      .from("pages")
      .select("*, author:profiles(*), categories(slug), page_tags(tag:tags(*))")
      .eq("id", id)
      .single();
    return data ? mapPage({ ...data, category_slug: data.categories?.slug }) : undefined;
  }

  async function createPage(data: Partial<Page>): Promise<Page> {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("No current user");
    const categoryId = await getCategoryIdBySlug(supabase, data.category || null);

    const { data: page, error } = await supabase
      .from("pages")
      .insert({
        author_id: currentUser.id,
        category_id: categoryId,
        title: data.title || "Untitled",
        description: data.description || null,
        file_url: data.file_url || "",
        is_open_source: data.is_open_source || false,
        source_code: data.source_code || null,
      })
      .select("*, author:profiles(*), categories(slug)")
      .single();

    if (error) throw error;
    return mapPage({ ...page, category_slug: page.categories?.slug });
  }

  async function uploadFiles(files: File[]): Promise<string> {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("No current user");

    const htmlFile = files.find((f) => f.name.endsWith(".html")) || files[0];
    const text = await htmlFile.text();

    const path = `${currentUser.id}/${Date.now()}/${htmlFile.name}`;
    const { error } = await supabase.storage.from(PAGES_BUCKET).upload(path, text, {
      contentType: "text/html",
    });
    if (error) throw error;

    const { data } = supabase.storage.from(PAGES_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  async function getComments(pageId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from("comments")
      .select("*, user:profiles(*)")
      .eq("page_id", pageId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      page_id: row.page_id,
      user_id: row.user_id,
      user: row.user ? mapUser(row.user) : undefined,
      parent_id: row.parent_id || null,
      content: row.content,
      created_at: row.created_at,
    }));
  }

  async function createComment(data: {
    page_id: string;
    content: string;
    parent_id?: string | null;
  }): Promise<Comment> {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("No current user");

    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        page_id: data.page_id,
        user_id: currentUser.id,
        parent_id: data.parent_id || null,
        content: data.content,
      })
      .select("*, user:profiles(*)")
      .single();
    if (error) throw error;

    await supabase.rpc("increment_comments_count", { page_id: data.page_id });

    return {
      id: comment.id,
      page_id: comment.page_id,
      user_id: comment.user_id,
      user: comment.user ? mapUser(comment.user) : undefined,
      parent_id: comment.parent_id || null,
      content: comment.content,
      created_at: comment.created_at,
    };
  }

  async function getChallenges(): Promise<Challenge[]> {
    const { data, error } = await supabase
      .from("challenges")
      .select("*, page:pages(*, author:profiles(*), categories(slug)), creator:profiles!challenges_creator_id_fkey(*), sponsor:profiles!challenges_sponsor_id_fkey(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => {
      const page = row.page
        ? mapPage({ ...row.page, category_slug: row.page.categories?.slug, author: row.page.author })
        : undefined;
      return {
        id: row.id,
        page_id: row.page_id || null,
        page,
        creator_id: row.creator_id,
        creator: row.creator ? mapUser(row.creator) : undefined,
        sponsor_id: row.sponsor_id || null,
        sponsor: row.sponsor ? mapUser(row.sponsor) : undefined,
        title: row.title,
        description: row.description || null,
        duration_days: row.duration_days || null,
        goal_type: row.goal_type || null,
        goal_value: row.goal_value || null,
        reward_text: row.reward_text || null,
        sponsor_message: row.sponsor_message || null,
        is_active: row.is_active,
        created_at: row.created_at,
        participants_count: 0,
        completed_count: 0,
      };
    });
  }

  async function getChallenge(id: string): Promise<Challenge | undefined> {
    const { data, error } = await supabase
      .from("challenges")
      .select("*, page:pages(*, author:profiles(*), categories(slug)), creator:profiles!challenges_creator_id_fkey(*), sponsor:profiles!challenges_sponsor_id_fkey(*)")
      .eq("id", id)
      .single();
    if (error || !data) return undefined;
    const row = data as any;
    const page = row.page
      ? mapPage({ ...row.page, category_slug: row.page.categories?.slug, author: row.page.author })
      : undefined;
    return {
      id: row.id,
      page_id: row.page_id || null,
      page,
      creator_id: row.creator_id,
      creator: row.creator ? mapUser(row.creator) : undefined,
      sponsor_id: row.sponsor_id || null,
      sponsor: row.sponsor ? mapUser(row.sponsor) : undefined,
      title: row.title,
      description: row.description || null,
      duration_days: row.duration_days || null,
      goal_type: row.goal_type || null,
      goal_value: row.goal_value || null,
      reward_text: row.reward_text || null,
      sponsor_message: row.sponsor_message || null,
      is_active: row.is_active,
      created_at: row.created_at,
      participants_count: 0,
      completed_count: 0,
    };
  }

  async function joinChallenge(challengeId: string): Promise<ChallengeParticipant> {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("No current user");

    const { data: existing } = await supabase
      .from("challenge_participants")
      .select("*")
      .eq("challenge_id", challengeId)
      .eq("user_id", currentUser.id)
      .single();
    if (existing) return existing as ChallengeParticipant;

    const { data, error } = await supabase
      .from("challenge_participants")
      .insert({ challenge_id: challengeId, user_id: currentUser.id })
      .select()
      .single();
    if (error) throw error;
    return data as ChallengeParticipant;
  }

  async function getChallengeProgress(challengeId: string): Promise<ChallengeParticipant | undefined> {
    const currentUser = await getCurrentUser();
    if (!currentUser) return undefined;
    const { data } = await supabase
      .from("challenge_participants")
      .select("*")
      .eq("challenge_id", challengeId)
      .eq("user_id", currentUser.id)
      .single();
    return data ? (data as ChallengeParticipant) : undefined;
  }

  async function updateChallengeProgress(
    challengeId: string,
    progress: number
  ): Promise<ChallengeParticipant> {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("No current user");
    let participant = await getChallengeProgress(challengeId);
    if (!participant) {
      participant = await joinChallenge(challengeId);
    }
    const completed = progress >= 100 && !participant.completed;
    const { data, error } = await supabase
      .from("challenge_participants")
      .update({
        progress: Math.min(progress, 100),
        completed,
        completed_at: completed ? new Date().toISOString() : participant.completed_at,
      })
      .eq("id", participant.id)
      .select()
      .single();
    if (error) throw error;
    return data as ChallengeParticipant;
  }

  async function getLeaderboard(): Promise<User[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "developer")
      .order("points", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapUser);
  }

  async function isFollowing(userId: string): Promise<boolean> {
    const currentUser = await getCurrentUser();
    if (!currentUser) return false;
    const { data } = await supabase
      .from("follows")
      .select("*")
      .eq("follower_id", currentUser.id)
      .eq("following_id", userId)
      .single();
    return !!data;
  }

  async function followUser(userId: string): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("No current user");
    const { error } = await supabase.from("follows").insert({
      follower_id: currentUser.id,
      following_id: userId,
    });
    if (error) throw error;
    await supabase.rpc("increment_follower_count", { user_id: userId });
    await supabase.rpc("increment_following_count", { user_id: currentUser.id });
  }

  async function unfollowUser(userId: string): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("No current user");
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", currentUser.id)
      .eq("following_id", userId);
    if (error) throw error;
    await supabase.rpc("decrement_follower_count", { user_id: userId });
    await supabase.rpc("decrement_following_count", { user_id: currentUser.id });
  }

  async function submitFeedback(data: {
    page_id: string;
    rating: number;
    custom_message?: string;
  }): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("No current user");
    await supabase
      .from("feedback")
      .upsert(
        {
          page_id: data.page_id,
          user_id: currentUser.id,
          rating: data.rating,
          custom_message: data.custom_message || null,
        },
        { onConflict: "page_id, user_id" }
      );
    await supabase.rpc("update_page_rating", { page_id: data.page_id });
  }

  async function incrementPageViews(pageId: string): Promise<void> {
    await supabase.rpc("increment_page_views", { page_id: pageId });
  }

  async function getPageLikes(pageId: string): Promise<number> {
    const { count, error } = await supabase
      .from("page_likes")
      .select("*", { count: "exact", head: true })
      .eq("page_id", pageId);
    if (error) throw error;
    return count || 0;
  }

  async function isPageLiked(pageId: string): Promise<boolean> {
    const currentUser = await getCurrentUser();
    if (!currentUser) return false;
    const { data } = await supabase
      .from("page_likes")
      .select("*")
      .eq("page_id", pageId)
      .eq("user_id", currentUser.id)
      .single();
    return !!data;
  }

  async function togglePageLike(pageId: string): Promise<boolean> {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("No current user");
    const liked = await isPageLiked(pageId);
    if (liked) {
      await supabase.from("page_likes").delete().eq("page_id", pageId).eq("user_id", currentUser.id);
      return false;
    }
    await supabase.from("page_likes").insert({ page_id: pageId, user_id: currentUser.id });
    return true;
  }

  async function createChallenge(data: Partial<Challenge>): Promise<Challenge> {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("No current user");
    const { data: challenge, error } = await supabase
      .from("challenges")
      .insert({
        page_id: data.page_id || null,
        creator_id: currentUser.id,
        sponsor_id: currentUser.role === "sponsor" ? currentUser.id : data.sponsor_id || null,
        title: data.title || "Nuevo reto",
        description: data.description || null,
        duration_days: data.duration_days || 30,
        goal_type: data.goal_type || "daily_usage",
        goal_value: data.goal_value || 30,
        reward_text: data.reward_text || null,
        sponsor_message: data.sponsor_message || null,
      })
      .select()
      .single();
    if (error) throw error;
    return challenge as unknown as Challenge;
  }

  function getCategories(): { value: PageCategory; label: string }[] {
    return [
      { value: "productivity", label: "Productividad" },
      { value: "health", label: "Salud" },
      { value: "entertainment", label: "Entretenimiento" },
      { value: "data", label: "Datos" },
      { value: "professional", label: "Profesional" },
    ];
  }

  async function getTags(): Promise<Tag[]> {
    const { data, error } = await supabase.from("tags").select("*").order("name");
    if (error) throw error;
    return (data || []).map((row: any) => ({ id: row.id, name: row.name }));
  }

  async function getPageTags(pageId: string): Promise<Tag[]> {
    const { data, error } = await supabase
      .from("page_tags")
      .select("tag:tags(*)")
      .eq("page_id", pageId);
    if (error) throw error;
    return (data || []).map((row: any) => ({ id: row.tag.id, name: row.tag.name }));
  }

  async function addPageTag(pageId: string, tagName: string): Promise<Tag> {
    const normalized = tagName.toLowerCase().trim();
    let { data: tag } = await supabase.from("tags").select("*").eq("name", normalized).single();
    if (!tag) {
      const { data: newTag } = await supabase.from("tags").insert({ name: normalized }).select("*").single();
      tag = newTag;
    }
    if (!tag) throw new Error("Failed to create tag");
    await supabase.from("page_tags").upsert({ page_id: pageId, tag_id: tag.id });
    return { id: tag.id, name: tag.name };
  }

  async function removePageTag(pageId: string, tagId: string): Promise<void> {
    await supabase.from("page_tags").delete().eq("page_id", pageId).eq("tag_id", tagId);
  }

  async function setPageTags(pageId: string, tagNames: string[]): Promise<Tag[]> {
    await supabase.from("page_tags").delete().eq("page_id", pageId);
    const tags: Tag[] = [];
    for (const name of tagNames) {
      const tag = await addPageTag(pageId, name);
      tags.push(tag);
    }
    return tags;
  }

  async function createPageVersion(pageId: string, changeSummary?: string): Promise<string> {
    const { data: page } = await supabase
      .from("pages")
      .select("source_code, file_url, title, description")
      .eq("id", pageId)
      .single();
    if (!page) throw new Error("Page not found");

    const { data: versionId, error } = await supabase.rpc("create_page_version", {
      p_page_id: pageId,
      p_source_code: page.source_code,
      p_file_url: page.file_url,
      p_title: page.title,
      p_description: page.description,
      p_change_summary: changeSummary || null,
    });

    if (error) throw error;
    return versionId;
  }

  async function getPageVersions(pageId: string): Promise<any[]> {
    const { data, error } = await supabase.rpc("get_page_versions", {
      p_page_id: pageId,
    });
    if (error) throw error;
    return data || [];
  }

  async function restorePageVersion(versionId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc("restore_page_version", {
      p_version_id: versionId,
    });
    if (error) throw error;
    return data;
  }

  async function getAchievements(userId: string): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", userId)
      .order("earned_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      badge_type: row.badge_type,
      earned_at: row.earned_at,
    }));
  }

  async function awardBadge(userId: string, badgeType: string): Promise<void> {
    const { error } = await supabase
      .from("achievements")
      .upsert({ user_id: userId, badge_type: badgeType }, { onConflict: "user_id,badge_type" });
    if (error) throw error;
  }

  async function checkAndAwardBadges(userId: string): Promise<string[]> {
    const awarded: string[] = [];

    // Check upload count
    const { count: uploadCount } = await supabase
      .from("pages")
      .select("*", { count: "exact", head: true })
      .eq("author_id", userId);

    if (uploadCount && uploadCount >= 1) {
      await awardBadge(userId, "first_upload");
      awarded.push("first_upload");
    }
    if (uploadCount && uploadCount >= 10) {
      await awardBadge(userId, "ten_uploads");
      awarded.push("ten_uploads");
    }

    // Check likes received
    const { count: likesCount } = await supabase
      .from("page_likes")
      .select("*", { count: "exact", head: true })
      .in("page_id",
        (await supabase.from("pages").select("id").eq("author_id", userId)).data?.map((p: any) => p.id) || []
      );

    if (likesCount && likesCount >= 100) {
      await awardBadge(userId, "hundred_likes");
      awarded.push("hundred_likes");
    }

    // Check challenges completed
    const { count: challengeCount } = await supabase
      .from("challenge_participants")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true);

    if (challengeCount && challengeCount >= 1) {
      await awardBadge(userId, "challenge_complete");
      awarded.push("challenge_complete");
    }

    return awarded;
  }

  async function logActivity(action: string, targetType: string, targetId: string, metadata?: Record<string, any>): Promise<void> {
    const currentUser = await getCurrentUser();
    if (!currentUser) return;
    await supabase.rpc("log_activity", {
      p_user_id: currentUser.id,
      p_action: action,
      p_target_type: targetType,
      p_target_id: targetId,
      p_metadata: metadata || {},
    });
  }

  async function getActivity(userId?: string, limit = 20): Promise<any[]> {
    const { data, error } = await supabase.rpc("get_user_activity", {
      p_user_id: userId || null,
      p_limit: limit,
    });
    if (error) throw error;
    return data || [];
  }

  async function getNotifications(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return data || [];
  }

  async function markNotificationRead(notificationId: string): Promise<void> {
    await supabase.from("notifications").update({ read: true }).eq("id", notificationId);
  }

  async function markAllNotificationsRead(userId: string): Promise<void> {
    await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
  }

  async function getUnreadNotificationCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("read", false);
    return count || 0;
  }

  async function toggleFeatured(pageId: string): Promise<boolean> {
    const { data: page } = await supabase.from("pages").select("is_featured").eq("id", pageId).single();
    if (!page) throw new Error("Page not found");
    const newVal = !page.is_featured;
    await supabase.from("pages").update({ is_featured: newVal }).eq("id", pageId);
    return newVal;
  }

  async function getFeaturedPages(limit = 3): Promise<Page[]> {
    const { data, error } = await supabase
      .from("pages")
      .select("*, author:profiles(*), categories(slug), page_tags(tag:tags(*))")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map((row: any) => mapPage({ ...row, category_slug: row.categories?.slug, page_tags: row.page_tags }));
  }

  return {
    getCurrentUser,
    getUser,
    getUsers,
    getPages,
    getPage,
    createPage,
    uploadFiles,
    getComments,
    createComment,
    getChallenges,
    getChallenge,
    joinChallenge,
    getChallengeProgress,
    updateChallengeProgress,
    getLeaderboard,
    isFollowing,
    followUser,
    unfollowUser,
    submitFeedback,
    incrementPageViews,
    getPageLikes,
    isPageLiked,
    togglePageLike,
    createChallenge,
    getCategories,
    getTags,
    getPageTags,
    addPageTag,
    removePageTag,
    setPageTags,
    toggleFeatured,
    getFeaturedPages,
    createPageVersion,
    getPageVersions,
    restorePageVersion,
    getAchievements,
    awardBadge,
    checkAndAwardBadges,
    logActivity,
    getActivity,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    getUnreadNotificationCount,
  };
}

export type SupabaseService = ReturnType<typeof createService>;

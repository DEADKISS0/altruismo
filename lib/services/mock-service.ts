import { Page, User, Challenge, Comment, ChallengeParticipant, PageCategory, Tag, Achievement, Review, RatingDistribution, Collection, CollectionItem } from "@/types";
import { encodeHtmlToDataUrl } from "@/lib/utils";
import { mockState, loadFromStorage, saveToStorage } from "./mock-storage";
import {
  getUserById,
  getPageById,
  getChallengeById,
} from "@/lib/services/mock-data";

export function loadMockData(): void {
  loadFromStorage();
}

let currentUserOverride: User | null = null;

export function setCurrentUser(user: User | null): void {
  currentUserOverride = user;
}

export function isSupabaseServiceConfigured(): boolean {
  return false;
}

function save(): void {
  saveToStorage();
}

export async function getCurrentUser(): Promise<User | null> {
  if (currentUserOverride) return currentUserOverride;
  return mockState.users.find((u) => u.id === mockState.currentUserId) || null;
}

export async function getUsers(): Promise<User[]> {
  return mockState.users;
}

export async function getUser(id: string): Promise<User | undefined> {
  return getUserById(id);
}

export async function getPages(params?: {
  category?: PageCategory | null;
  search?: string;
  authorId?: string;
}): Promise<Page[]> {
  let pages = [...mockState.pages];
  if (params?.category) {
    pages = pages.filter((p) => p.category === params.category);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    pages = pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }
  if (params?.authorId) {
    pages = pages.filter((p) => p.author_id === params.authorId);
  }
  return pages.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getPage(id: string): Promise<Page | undefined> {
  return getPageById(id);
}

export async function createPage(data: Partial<Page>): Promise<Page> {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("No current user");
  const newPage: Page = {
    id: `page-${Date.now()}`,
    author_id: currentUser.id,
    author: currentUser,
    title: data.title || "Untitled",
    description: data.description || null,
    category: data.category || null,
    file_url: data.file_url || "",
    is_open_source: data.is_open_source || false,
    source_code: data.source_code || null,
    views: 0,
    average_rating: 0,
    created_at: new Date().toISOString(),
    comments_count: 0,
  };
  mockState.pages.unshift(newPage);
  save();
  return newPage;
}

export async function getComments(pageId: string): Promise<Comment[]> {
  return mockState.comments
    .filter((c) => c.page_id === pageId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function createComment(data: {
  page_id: string;
  content: string;
  parent_id?: string | null;
}): Promise<Comment> {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("No current user");
  const comment: Comment = {
    id: `comment-${Date.now()}`,
    page_id: data.page_id,
    user_id: currentUser.id,
    user: currentUser,
    parent_id: data.parent_id ?? null,
    content: data.content,
    created_at: new Date().toISOString(),
  };
  mockState.comments.unshift(comment);
  const page = getPageById(data.page_id);
  if (page) page.comments_count = (page.comments_count || 0) + 1;
  save();
  return comment;
}

export async function getChallenges(): Promise<Challenge[]> {
  return mockState.challenges;
}

export async function getChallenge(id: string): Promise<Challenge | undefined> {
  return getChallengeById(id);
}

export async function createChallenge(
  data: Partial<Challenge>
): Promise<Challenge> {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("No current user");
  const challenge: Challenge = {
    id: `challenge-${Date.now()}`,
    page_id: data.page_id || null,
    page: data.page_id ? getPageById(data.page_id) : undefined,
    creator_id: currentUser.id,
    creator: currentUser,
    sponsor_id: currentUser.role === "sponsor" ? currentUser.id : null,
    sponsor: currentUser.role === "sponsor" ? currentUser : undefined,
    title: data.title || "Nuevo reto",
    description: data.description || null,
    duration_days: data.duration_days || 30,
    goal_type: data.goal_type || "daily_usage",
    goal_value: data.goal_value || 30,
    reward_text: data.reward_text || null,
    sponsor_message: data.sponsor_message || null,
    is_active: true,
    created_at: new Date().toISOString(),
    participants_count: 0,
    completed_count: 0,
  };
  mockState.challenges.unshift(challenge);
  save();
  return challenge;
}

export async function joinChallenge(challengeId: string): Promise<ChallengeParticipant> {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("No current user");
  let participant = mockState.participants.find(
    (p) => p.challenge_id === challengeId && p.user_id === currentUser.id
  );
  if (participant) return participant;

  participant = {
    id: `part-${Date.now()}`,
    challenge_id: challengeId,
    user_id: currentUser.id,
    user: currentUser,
    progress: 0,
    completed: false,
    completed_at: null,
  };
  mockState.participants.push(participant);
  const challenge = getChallengeById(challengeId);
  if (challenge) challenge.participants_count = (challenge.participants_count || 0) + 1;
  save();
  return participant;
}

export async function getChallengeProgress(challengeId: string): Promise<ChallengeParticipant | undefined> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return undefined;
  return mockState.participants.find(
    (p) => p.challenge_id === challengeId && p.user_id === currentUser.id
  );
}

export async function updateChallengeProgress(
  challengeId: string,
  progress: number
): Promise<ChallengeParticipant> {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("No current user");
  let participant = mockState.participants.find(
    (p) => p.challenge_id === challengeId && p.user_id === currentUser.id
  );
  if (!participant) {
    participant = await joinChallenge(challengeId);
  }
  participant.progress = Math.min(progress, 100);
  const challenge = getChallengeById(challengeId);
  if (challenge && participant.progress >= 100 && !participant.completed) {
    participant.completed = true;
    participant.completed_at = new Date().toISOString();
    challenge.completed_count = (challenge.completed_count || 0) + 1;
  }
  save();
  return participant;
}

export async function getLeaderboard(): Promise<User[]> {
  return [...mockState.users]
    .filter((u) => u.role === "developer")
    .sort((a, b) => b.points - a.points);
}

export async function isFollowing(userId: string): Promise<boolean> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return false;
  return mockState.follows.includes(`${currentUser.id}:${userId}`);
}

export async function followUser(userId: string): Promise<void> {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("No current user");
  const key = `${currentUser.id}:${userId}`;
  if (!mockState.follows.includes(key)) {
    mockState.follows.push(key);
    const target = getUserById(userId);
    if (target) target.followers_count = (target.followers_count || 0) + 1;
    currentUser.following_count = (currentUser.following_count || 0) + 1;
  }
  save();
}

export async function unfollowUser(userId: string): Promise<void> {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("No current user");
  const key = `${currentUser.id}:${userId}`;
  const index = mockState.follows.indexOf(key);
  if (index > -1) {
    mockState.follows.splice(index, 1);
    const target = getUserById(userId);
    if (target) target.followers_count = Math.max((target.followers_count || 0) - 1, 0);
    currentUser.following_count = Math.max((currentUser.following_count || 0) - 1, 0);
  }
  save();
}

export async function submitFeedback(data: {
  page_id: string;
  rating: number;
  custom_message?: string;
}): Promise<void> {
  const page = getPageById(data.page_id);
  if (page) {
    page.average_rating = Math.round((page.average_rating + data.rating) / 2 * 10) / 10;
    save();
  }
}

export async function incrementPageViews(pageId: string): Promise<void> {
  const page = getPageById(pageId);
  if (page) {
    page.views = (page.views || 0) + 1;
    save();
  }
}

export async function getPageLikes(pageId: string): Promise<number> {
  return mockState.likes.filter((l) => l.page_id === pageId).length;
}

export async function isPageLiked(pageId: string): Promise<boolean> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return false;
  return mockState.likes.some(
    (l) => l.page_id === pageId && l.user_id === currentUser.id
  );
}

export async function togglePageLike(pageId: string): Promise<boolean> {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("No current user");
  const index = mockState.likes.findIndex(
    (l) => l.page_id === pageId && l.user_id === currentUser.id
  );
  if (index > -1) {
    mockState.likes.splice(index, 1);
    save();
    return false;
  }
  mockState.likes.push({ page_id: pageId, user_id: currentUser.id });
  save();
  return true;
}

export async function uploadFiles(files: File[]): Promise<string> {
  const htmlFile = files.find((f) => f.name.endsWith(".html")) || files[0];
  const text = await htmlFile.text();
  return encodeHtmlToDataUrl(text);
}

let mockTags: Tag[] = [
  { id: "tag-1", name: "javascript" },
  { id: "tag-2", name: "css" },
  { id: "tag-3", name: "html" },
  { id: "tag-4", name: "api" },
  { id: "tag-5", name: "responsive" },
  { id: "tag-6", name: "dark-mode" },
  { id: "tag-7", name: "accesibilidad" },
  { id: "tag-8", name: "productividad" },
  { id: "tag-9", name: "datos" },
  { id: "tag-10", name: "utilidades" },
];

let mockPageTags: { page_id: string; tag_id: string }[] = [];

export async function getTags(): Promise<Tag[]> {
  return [...mockTags];
}

export async function getPageTags(pageId: string): Promise<Tag[]> {
  return mockPageTags
    .filter((pt) => pt.page_id === pageId)
    .map((pt) => mockTags.find((t) => t.id === pt.tag_id))
    .filter(Boolean) as Tag[];
}

export async function addPageTag(pageId: string, tagName: string): Promise<Tag> {
  const normalized = tagName.toLowerCase().trim();
  let tag = mockTags.find((t) => t.name === normalized);
  if (!tag) {
    tag = { id: `tag-${Date.now()}`, name: normalized };
    mockTags.push(tag);
  }
  const exists = mockPageTags.some((pt) => pt.page_id === pageId && pt.tag_id === tag!.id);
  if (!exists) {
    mockPageTags.push({ page_id: pageId, tag_id: tag.id });
  }
  return tag;
}

export async function removePageTag(pageId: string, tagId: string): Promise<void> {
  mockPageTags = mockPageTags.filter((pt) => !(pt.page_id === pageId && pt.tag_id === tagId));
}

export async function setPageTags(pageId: string, tagNames: string[]): Promise<Tag[]> {
  mockPageTags = mockPageTags.filter((pt) => pt.page_id !== pageId);
  const tags: Tag[] = [];
  for (const name of tagNames) {
    const tag = await addPageTag(pageId, name);
    tags.push(tag);
  }
  return tags;
}

let mockFeaturedIds = new Set<string>();

export async function toggleFeatured(pageId: string): Promise<boolean> {
  if (mockFeaturedIds.has(pageId)) {
    mockFeaturedIds.delete(pageId);
    return false;
  }
  mockFeaturedIds.add(pageId);
  return true;
}

export async function getFeaturedPages(limit = 3): Promise<Page[]> {
  return mockState.pages
    .filter((p) => mockFeaturedIds.has(p.id))
    .slice(0, limit)
    .map((p) => ({ ...p, author: mockState.users.find((u) => u.id === p.author_id) }));
}

let mockVersions: any[] = [];

export async function createPageVersion(pageId: string, changeSummary?: string): Promise<string> {
  const page = mockState.pages.find((p) => p.id === pageId);
  if (!page) throw new Error("Page not found");
  const versionNumber = mockVersions.filter((v) => v.page_id === pageId).length + 1;
  const versionId = `version-${Date.now()}`;
  mockVersions.push({
    id: versionId,
    page_id: pageId,
    version_number: versionNumber,
    source_code: page.source_code,
    file_url: page.file_url,
    title: page.title,
    description: page.description,
    change_summary: changeSummary || null,
    created_at: new Date().toISOString(),
  });
  return versionId;
}

export async function getPageVersions(pageId: string): Promise<any[]> {
  return mockVersions
    .filter((v) => v.page_id === pageId)
    .sort((a, b) => b.version_number - a.version_number);
}

export async function restorePageVersion(versionId: string): Promise<boolean> {
  const version = mockVersions.find((v) => v.id === versionId);
  if (!version) return false;
  const page = mockState.pages.find((p) => p.id === version.page_id);
  if (!page) return false;
  page.source_code = version.source_code;
  page.file_url = version.file_url;
  page.title = version.title;
  page.description = version.description;
  return true;
}

let mockAchievements: Achievement[] = [];

export async function getAchievements(userId: string): Promise<Achievement[]> {
  return mockAchievements.filter((a) => a.user_id === userId);
}

let mockReviews: any[] = [];

export async function getReviews(pageId: string): Promise<Review[]> {
  return mockReviews.filter(r => r.page_id === pageId);
}

export async function addReview(pageId: string, rating: number, content?: string): Promise<Review> {
  const user = await getCurrentUser();
  if (!user) throw new Error("No current user");
  const existing = mockReviews.findIndex(r => r.page_id === pageId && r.user_id === user.id);
  const review: Review = {
    id: `review-${Date.now()}`,
    page_id: pageId,
    user_id: user.id,
    user,
    rating,
    content: content || null,
    created_at: new Date().toISOString(),
  };
  if (existing >= 0) {
    mockReviews[existing] = review;
  } else {
    mockReviews.push(review);
  }
  return review;
}

export async function getRatingDistribution(pageId: string): Promise<RatingDistribution[]> {
  const reviews = mockReviews.filter(r => r.page_id === pageId);
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(r => { counts[r.rating] = (counts[r.rating] || 0) + 1; });
  return Object.entries(counts).map(([k, v]) => ({ rating: Number(k), count: v }));
}

let mockCollections: Collection[] = [];
let mockCollectionItems: CollectionItem[] = [];

export async function getCollections(userId?: string): Promise<Collection[]> {
  let filtered = mockCollections;
  if (userId) filtered = filtered.filter(c => c.user_id === userId);
  return filtered;
}

export async function getCollectionItems(collectionId: string): Promise<CollectionItem[]> {
  return mockCollectionItems
    .filter(i => i.collection_id === collectionId)
    .map(i => ({
      ...i,
      page: mockState.pages.find(p => p.id === i.page_id),
    }));
}

export async function createCollection(name: string, description?: string, isPublic?: boolean): Promise<Collection> {
  const user = await getCurrentUser();
  if (!user) throw new Error("No current user");
  const col: Collection = {
    id: `col-${Date.now()}`,
    user_id: user.id,
    name,
    description: description || null,
    is_public: isPublic !== false,
    created_at: new Date().toISOString(),
  };
  mockCollections.push(col);
  return col;
}

export async function addToCollection(collectionId: string, pageId: string): Promise<CollectionItem> {
  const existing = mockCollectionItems.find(i => i.collection_id === collectionId && i.page_id === pageId);
  if (existing) return existing;
  const item: CollectionItem = {
    id: `item-${Date.now()}`,
    collection_id: collectionId,
    page_id: pageId,
    position: mockCollectionItems.filter(i => i.collection_id === collectionId).length,
    added_at: new Date().toISOString(),
  };
  mockCollectionItems.push(item);
  return item;
}

export async function removeFromCollection(collectionId: string, pageId: string): Promise<void> {
  mockCollectionItems = mockCollectionItems.filter(i => !(i.collection_id === collectionId && i.page_id === pageId));
}

export async function awardBadge(userId: string, badgeType: string): Promise<void> {
  const exists = mockAchievements.some(
    (a) => a.user_id === userId && a.badge_type === badgeType
  );
  if (!exists) {
    mockAchievements.push({
      id: `ach-${Date.now()}`,
      user_id: userId,
      badge_type: badgeType,
      earned_at: new Date().toISOString(),
    });
  }
}

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const awarded: string[] = [];
  const uploadCount = mockState.pages.filter((p) => p.author_id === userId).length;
  if (uploadCount >= 1) { await awardBadge(userId, "first_upload"); awarded.push("first_upload"); }
  if (uploadCount >= 10) { await awardBadge(userId, "ten_uploads"); awarded.push("ten_uploads"); }
  return awarded;
}

let mockActivity: any[] = [];

export async function logActivity(action: string, targetType: string, targetId: string, metadata?: Record<string, any>): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  mockActivity.unshift({
    id: `act-${Date.now()}`,
    user_id: user.id,
    action,
    target_type: targetType,
    target_id: targetId,
    metadata: metadata || {},
    created_at: new Date().toISOString(),
  });
}

export async function getActivity(userId?: string, limit = 20): Promise<any[]> {
  let activities = userId
    ? mockActivity.filter((a) => a.user_id === userId)
    : mockActivity;
  return activities.slice(0, limit).map((a) => {
    const user = mockState.users.find((u) => u.id === a.user_id);
    let targetTitle = "";
    if (a.target_type === "page") {
      const page = mockState.pages.find((p) => p.id === a.target_id);
      targetTitle = page?.title || "";
    }
    return { ...a, user_name: user?.name, user_avatar: user?.avatar_url, target_title: targetTitle };
  });
}

let mockNotifications: any[] = [];

export async function getNotifications(userId: string): Promise<any[]> {
  return mockNotifications.filter((n) => n.user_id === userId);
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const n = mockNotifications.find((n) => n.id === notificationId);
  if (n) n.read = true;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  mockNotifications.forEach((n) => { if (n.user_id === userId) n.read = true; });
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return mockNotifications.filter((n) => n.user_id === userId && !n.read).length;
}

export function getCategories(): { value: PageCategory; label: string }[] {
  return [
    { value: "productivity", label: "Productividad" },
    { value: "health", label: "Salud" },
    { value: "entertainment", label: "Entretenimiento" },
    { value: "data", label: "Datos" },
    { value: "professional", label: "Profesional" },
  ];
}

export { mockState, loadFromStorage, saveToStorage };

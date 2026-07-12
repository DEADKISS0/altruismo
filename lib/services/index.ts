import { Page, User, Challenge, Comment, ChallengeParticipant, PageCategory } from "@/types";
import { encodeHtmlToDataUrl } from "@/lib/utils";
import {
  mockPages,
  mockChallenges,
  mockComments,
  mockParticipants,
  mockUsers,
  mockCurrentUser,
  follows,
  getUserById,
  getPageById,
  getChallengeById,
} from "@/lib/services/mock-data";

// In the future, this file will switch between Supabase and mock data based on env vars.
// For now, we use the mock layer to deliver a functional MVP immediately.

export async function getCurrentUser(): Promise<User | null> {
  return mockCurrentUser;
}

export async function getUsers(): Promise<User[]> {
  return mockUsers;
}

export async function getUser(id: string): Promise<User | undefined> {
  return getUserById(id);
}

export async function getPages(params?: {
  category?: PageCategory | null;
  search?: string;
  authorId?: string;
}): Promise<Page[]> {
  let pages = [...mockPages];
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
  const newPage: Page = {
    id: `page-${Date.now()}`,
    author_id: mockCurrentUser.id,
    author: mockCurrentUser,
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
  mockPages.unshift(newPage);
  return newPage;
}

export async function getComments(pageId: string): Promise<Comment[]> {
  return mockComments.filter((c) => c.page_id === pageId);
}

export async function createComment(data: {
  page_id: string;
  content: string;
}): Promise<Comment> {
  const comment: Comment = {
    id: `comment-${Date.now()}`,
    page_id: data.page_id,
    user_id: mockCurrentUser.id,
    user: mockCurrentUser,
    parent_id: null,
    content: data.content,
    created_at: new Date().toISOString(),
  };
  mockComments.unshift(comment);
  const page = getPageById(data.page_id);
  if (page) page.comments_count = (page.comments_count || 0) + 1;
  return comment;
}

export async function getChallenges(): Promise<Challenge[]> {
  return mockChallenges;
}

export async function getChallenge(id: string): Promise<Challenge | undefined> {
  return getChallengeById(id);
}

export async function createChallenge(
  data: Partial<Challenge>
): Promise<Challenge> {
  const challenge: Challenge = {
    id: `challenge-${Date.now()}`,
    page_id: data.page_id || null,
    page: data.page_id ? getPageById(data.page_id) : undefined,
    creator_id: mockCurrentUser.id,
    creator: mockCurrentUser,
    sponsor_id: mockCurrentUser.role === "sponsor" ? mockCurrentUser.id : null,
    sponsor: mockCurrentUser.role === "sponsor" ? mockCurrentUser : undefined,
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
  mockChallenges.unshift(challenge);
  return challenge;
}

export async function joinChallenge(challengeId: string): Promise<ChallengeParticipant> {
  const participant: ChallengeParticipant = {
    id: `part-${Date.now()}`,
    challenge_id: challengeId,
    user_id: mockCurrentUser.id,
    user: mockCurrentUser,
    progress: 0,
    completed: false,
    completed_at: null,
  };
  mockParticipants.push(participant);
  const challenge = getChallengeById(challengeId);
  if (challenge) challenge.participants_count = (challenge.participants_count || 0) + 1;
  return participant;
}

export async function updateChallengeProgress(
  challengeId: string,
  progress: number
): Promise<ChallengeParticipant> {
  let participant = mockParticipants.find(
    (p) => p.challenge_id === challengeId && p.user_id === mockCurrentUser.id
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
  return participant;
}

export async function getLeaderboard(): Promise<User[]> {
  return [...mockUsers]
    .filter((u) => u.role === "developer")
    .sort((a, b) => b.points - a.points);
}

export async function isFollowing(userId: string): Promise<boolean> {
  return follows.has(userId);
}

export async function followUser(userId: string): Promise<void> {
  follows.add(userId);
}

export async function unfollowUser(userId: string): Promise<void> {
  follows.delete(userId);
}

export async function submitFeedback(data: {
  page_id: string;
  rating: number;
  custom_message?: string;
}): Promise<void> {
    // Feedback stored
}

export async function uploadFiles(files: File[]): Promise<string> {
  const htmlFile = files.find((f) => f.name.endsWith(".html")) || files[0];
  const text = await htmlFile.text();
  return encodeHtmlToDataUrl(text);
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

export { mockCurrentUser };

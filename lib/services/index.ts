import { Page, User, Challenge, Comment, ChallengeParticipant, PageCategory, Tag, Achievement } from "@/types";
import * as mock from "./mock-service";
import { isSupabaseServiceConfigured } from "./supabase-config";

function useSupabase(): boolean {
  return isSupabaseServiceConfigured();
}

let supabaseServicePromise: Promise<any> | null = null;

async function getSupabaseService(): Promise<any> {
  if (supabaseServicePromise) return supabaseServicePromise;
  if (typeof window === "undefined") {
    supabaseServicePromise = import(/* webpackIgnore: true */ "./supabase-server").then((mod) => mod.getSupabaseService());
  } else {
    supabaseServicePromise = import("./supabase-client").then((mod) => mod.supabaseService);
  }
  return supabaseServicePromise;
}

export function loadMockData(): void {
  if (!useSupabase()) mock.loadMockData();
}

export function setCurrentUser(user: User | null): void {
  if (!useSupabase()) mock.setCurrentUser(user);
}

export async function getCurrentUser(): Promise<User | null> {
  if (!useSupabase()) return mock.getCurrentUser();
  return (await getSupabaseService()).getCurrentUser();
}

export async function getUsers(): Promise<User[]> {
  return useSupabase() ? (await getSupabaseService()).getUsers() : mock.getUsers();
}

export async function getUser(id: string): Promise<User | undefined> {
  return useSupabase() ? (await getSupabaseService()).getUser(id) : mock.getUser(id);
}

export async function getPages(params?: {
  category?: PageCategory | null;
  search?: string;
  authorId?: string;
}): Promise<Page[]> {
  return useSupabase()
    ? (await getSupabaseService()).getPages(params)
    : mock.getPages(params);
}

export async function getPage(id: string): Promise<Page | undefined> {
  return useSupabase() ? (await getSupabaseService()).getPage(id) : mock.getPage(id);
}

export async function createPage(data: Partial<Page>): Promise<Page> {
  return useSupabase()
    ? (await getSupabaseService()).createPage(data)
    : mock.createPage(data);
}

export async function getComments(pageId: string): Promise<Comment[]> {
  return useSupabase()
    ? (await getSupabaseService()).getComments(pageId)
    : mock.getComments(pageId);
}

export async function createComment(data: {
  page_id: string;
  content: string;
  parent_id?: string | null;
}): Promise<Comment> {
  return useSupabase()
    ? (await getSupabaseService()).createComment(data)
    : mock.createComment(data);
}

export async function getChallenges(): Promise<Challenge[]> {
  return useSupabase() ? (await getSupabaseService()).getChallenges() : mock.getChallenges();
}

export async function getChallenge(id: string): Promise<Challenge | undefined> {
  return useSupabase() ? (await getSupabaseService()).getChallenge(id) : mock.getChallenge(id);
}

export async function createChallenge(data: Partial<Challenge>): Promise<Challenge> {
  return useSupabase()
    ? (await getSupabaseService()).createChallenge(data)
    : mock.createChallenge(data);
}

export async function joinChallenge(challengeId: string): Promise<ChallengeParticipant> {
  return useSupabase()
    ? (await getSupabaseService()).joinChallenge(challengeId)
    : mock.joinChallenge(challengeId);
}

export async function getChallengeProgress(challengeId: string): Promise<ChallengeParticipant | undefined> {
  return useSupabase()
    ? (await getSupabaseService()).getChallengeProgress(challengeId)
    : mock.getChallengeProgress(challengeId);
}

export async function updateChallengeProgress(
  challengeId: string,
  progress: number
): Promise<ChallengeParticipant> {
  return useSupabase()
    ? (await getSupabaseService()).updateChallengeProgress(challengeId, progress)
    : mock.updateChallengeProgress(challengeId, progress);
}

export async function getLeaderboard(): Promise<User[]> {
  return useSupabase() ? (await getSupabaseService()).getLeaderboard() : mock.getLeaderboard();
}

export async function isFollowing(userId: string): Promise<boolean> {
  return useSupabase() ? (await getSupabaseService()).isFollowing(userId) : mock.isFollowing(userId);
}

export async function followUser(userId: string): Promise<void> {
  return useSupabase() ? (await getSupabaseService()).followUser(userId) : mock.followUser(userId);
}

export async function unfollowUser(userId: string): Promise<void> {
  return useSupabase()
    ? (await getSupabaseService()).unfollowUser(userId)
    : mock.unfollowUser(userId);
}

export async function submitFeedback(data: {
  page_id: string;
  rating: number;
  custom_message?: string;
}): Promise<void> {
  return useSupabase()
    ? (await getSupabaseService()).submitFeedback(data)
    : mock.submitFeedback(data);
}

export async function incrementPageViews(pageId: string): Promise<void> {
  return useSupabase()
    ? (await getSupabaseService()).incrementPageViews(pageId)
    : mock.incrementPageViews(pageId);
}

export async function getPageLikes(pageId: string): Promise<number> {
  return useSupabase()
    ? (await getSupabaseService()).getPageLikes(pageId)
    : mock.getPageLikes(pageId);
}

export async function isPageLiked(pageId: string): Promise<boolean> {
  return useSupabase()
    ? (await getSupabaseService()).isPageLiked(pageId)
    : mock.isPageLiked(pageId);
}

export async function togglePageLike(pageId: string): Promise<boolean> {
  return useSupabase()
    ? (await getSupabaseService()).togglePageLike(pageId)
    : mock.togglePageLike(pageId);
}

export async function uploadFiles(files: File[]): Promise<string> {
  return useSupabase()
    ? (await getSupabaseService()).uploadFiles(files)
    : mock.uploadFiles(files);
}

export async function getTags(): Promise<Tag[]> {
  return useSupabase() ? (await getSupabaseService()).getTags() : mock.getTags();
}

export async function getPageTags(pageId: string): Promise<Tag[]> {
  return useSupabase() ? (await getSupabaseService()).getPageTags(pageId) : mock.getPageTags(pageId);
}

export async function addPageTag(pageId: string, tagName: string): Promise<Tag> {
  return useSupabase()
    ? (await getSupabaseService()).addPageTag(pageId, tagName)
    : mock.addPageTag(pageId, tagName);
}

export async function removePageTag(pageId: string, tagId: string): Promise<void> {
  return useSupabase()
    ? (await getSupabaseService()).removePageTag(pageId, tagId)
    : mock.removePageTag(pageId, tagId);
}

export async function setPageTags(pageId: string, tagNames: string[]): Promise<Tag[]> {
  return useSupabase()
    ? (await getSupabaseService()).setPageTags(pageId, tagNames)
    : mock.setPageTags(pageId, tagNames);
}

export async function toggleFeatured(pageId: string): Promise<boolean> {
  return useSupabase()
    ? (await getSupabaseService()).toggleFeatured(pageId)
    : mock.toggleFeatured(pageId);
}

export async function getFeaturedPages(limit = 3): Promise<Page[]> {
  return useSupabase()
    ? (await getSupabaseService()).getFeaturedPages(limit)
    : mock.getFeaturedPages(limit);
}

export async function createPageVersion(pageId: string, changeSummary?: string): Promise<string> {
  return useSupabase()
    ? (await getSupabaseService()).createPageVersion(pageId, changeSummary)
    : mock.createPageVersion(pageId, changeSummary);
}

export async function getPageVersions(pageId: string): Promise<any[]> {
  return useSupabase()
    ? (await getSupabaseService()).getPageVersions(pageId)
    : mock.getPageVersions(pageId);
}

export async function restorePageVersion(versionId: string): Promise<boolean> {
  return useSupabase()
    ? (await getSupabaseService()).restorePageVersion(versionId)
    : mock.restorePageVersion(versionId);
}

export async function getAchievements(userId: string): Promise<Achievement[]> {
  return useSupabase()
    ? (await getSupabaseService()).getAchievements(userId)
    : mock.getAchievements(userId);
}

export async function awardBadge(userId: string, badgeType: string): Promise<void> {
  return useSupabase()
    ? (await getSupabaseService()).awardBadge(userId, badgeType)
    : mock.awardBadge(userId, badgeType);
}

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  return useSupabase()
    ? (await getSupabaseService()).checkAndAwardBadges(userId)
    : mock.checkAndAwardBadges(userId);
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

export { mockState, loadFromStorage, saveToStorage } from "./mock-service";

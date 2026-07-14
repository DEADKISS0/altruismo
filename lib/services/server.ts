import { createClient } from "@/lib/supabase/server";
import { createService, SupabaseService } from "./supabase-service";
import { Page, User, Challenge, Comment, PageCategory } from "@/types";

async function withService<T>(fn: (service: SupabaseService) => Promise<T>): Promise<T> {
  const client = await createClient();
  const service = createService(client);
  return fn(service);
}

export async function getCurrentUser(): Promise<User | null> {
  return withService((s) => s.getCurrentUser());
}

export async function getUsers(): Promise<User[]> {
  return withService((s) => s.getUsers());
}

export async function getUser(id: string): Promise<User | undefined> {
  return withService((s) => s.getUser(id));
}

export async function getPages(params?: {
  category?: PageCategory | null;
  search?: string;
  authorId?: string;
}): Promise<Page[]> {
  return withService((s) => s.getPages(params));
}

export async function getPage(id: string): Promise<Page | undefined> {
  return withService((s) => s.getPage(id));
}

export async function getComments(pageId: string): Promise<Comment[]> {
  return withService((s) => s.getComments(pageId));
}

export async function getChallenges(): Promise<Challenge[]> {
  return withService((s) => s.getChallenges());
}

export async function getChallenge(id: string): Promise<Challenge | undefined> {
  return withService((s) => s.getChallenge(id));
}

export async function getLeaderboard(): Promise<User[]> {
  return withService((s) => s.getLeaderboard());
}

export async function getFeaturedPages(limit = 3): Promise<Page[]> {
  return withService((s) => s.getFeaturedPages(limit));
}
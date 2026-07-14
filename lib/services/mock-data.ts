import { User, Page, Challenge, Comment, ChallengeParticipant } from "@/types";
import { mockState, saveToStorage } from "./mock-storage";

// Initialize on module load (safe on server, no-op on client until loadFromStorage is called)
export const mockCurrentUser: User = mockState.users[0];
export const mockPages: Page[] = mockState.pages;
export const mockChallenges: Challenge[] = mockState.challenges;
export const mockComments: Comment[] = mockState.comments;
export const mockParticipants: ChallengeParticipant[] = mockState.participants;
export const follows = new Set<string>(mockState.follows);

export const mockUsers: User[] = mockState.users;

export function getUserById(id: string): User | undefined {
  return mockState.users.find((u) => u.id === id);
}

export function getPageById(id: string): Page | undefined {
  return mockState.pages.find((p) => p.id === id);
}

export function getChallengeById(id: string): Challenge | undefined {
  return mockState.challenges.find((c) => c.id === id);
}

export function syncFollowsToState(): void {
  mockState.follows.length = 0;
  mockState.follows.push(...Array.from(follows));
  saveToStorage();
}

export { mockState, saveToStorage };

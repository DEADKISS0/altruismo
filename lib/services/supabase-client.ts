import { createClient } from "@/lib/supabase/client";
import { createService } from "./supabase-service";

export * from "./supabase-service";

const client = createClient();
export const supabaseService = createService(client);

export const {
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
} = supabaseService;

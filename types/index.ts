import { Locale } from "@/lib/i18n/config";

export type UserRole = "developer" | "user" | "sponsor" | "admin";

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  points: number;
  level: number;
  created_at: string;
  followers_count?: number;
  following_count?: number;
}

export type PageCategory =
  | "productivity"
  | "health"
  | "entertainment"
  | "data"
  | "professional";

export interface Tag {
  id: string;
  name: string;
}

export interface Page {
  id: string;
  author_id: string;
  author?: User;
  title: string;
  description: string | null;
  category: PageCategory | null;
  file_url: string;
  is_open_source: boolean;
  is_featured?: boolean;
  source_code: string | null;
  views: number;
  average_rating: number;
  created_at: string;
  comments_count?: number;
  tags?: Tag[];
}

export type ChallengeGoalType = "daily_usage" | "milestone" | "community";

export interface Challenge {
  id: string;
  page_id: string | null;
  page?: Page;
  creator_id: string;
  creator?: User;
  sponsor_id: string | null;
  sponsor?: User;
  title: string;
  description: string | null;
  duration_days: number | null;
  goal_type: ChallengeGoalType | null;
  goal_value: number | null;
  reward_text: string | null;
  sponsor_message: string | null;
  is_active: boolean;
  created_at: string;
  participants_count?: number;
  completed_count?: number;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  user?: User;
  progress: number;
  completed: boolean;
  completed_at: string | null;
}

export interface Comment {
  id: string;
  page_id: string;
  user_id: string;
  user?: User;
  parent_id: string | null;
  content: string;
  created_at: string;
}

export interface Feedback {
  id: string;
  page_id: string;
  user_id: string;
  rating: number;
  custom_message: string | null;
  usage_minutes: number | null;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  badge_type: string;
  earned_at: string;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  items_count?: number;
  created_at: string;
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  page_id: string;
  page?: Page;
  position: number;
  added_at: string;
}

export interface Review {
  id: string;
  page_id: string;
  user_id: string;
  user?: User;
  rating: number;
  content: string | null;
  created_at: string;
}

export interface RatingDistribution {
  rating: number;
  count: number;
}

export interface CategoryLabel {
  value: PageCategory;
  label: string;
}

export interface LocaleParams {
  params: Promise<{ locale: Locale }>;
}

export interface PageParams {
  params: Promise<{ locale: Locale; id: string }>;
}

export interface ProfileParams {
  params: Promise<{ locale: Locale; id: string }>;
}

export interface ChallengeParams {
  params: Promise<{ locale: Locale; id: string }>;
}

export interface DashboardParams {
  params: Promise<{ locale: Locale }>;
}

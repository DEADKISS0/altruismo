export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          bio: string | null;
          role: "developer" | "user" | "sponsor" | "admin";
          points: number;
          level: number;
          followers_count: number;
          following_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: "developer" | "user" | "sponsor" | "admin";
          points?: number;
          level?: number;
          followers_count?: number;
          following_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          role?: "developer" | "user" | "sponsor" | "admin";
          points?: number;
          level?: number;
          followers_count?: number;
          following_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          created_at?: string;
        };
      };
      pages: {
        Row: {
          id: string;
          author_id: string;
          category_id: string | null;
          title: string;
          description: string | null;
          file_url: string;
          is_open_source: boolean;
          source_code: string | null;
          views: number;
          average_rating: number;
          comments_count: number;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          category_id?: string | null;
          title: string;
          description?: string | null;
          file_url: string;
          is_open_source?: boolean;
          source_code?: string | null;
          views?: number;
          average_rating?: number;
          comments_count?: number;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          category_id?: string | null;
          title?: string;
          description?: string | null;
          file_url?: string;
          is_open_source?: boolean;
          source_code?: string | null;
          views?: number;
          average_rating?: number;
          comments_count?: number;
          is_featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
        };
      };
      page_tags: {
        Row: {
          page_id: string;
          tag_id: string;
        };
      };
      challenges: {
        Row: {
          id: string;
          page_id: string | null;
          creator_id: string;
          sponsor_id: string | null;
          title: string;
          description: string | null;
          duration_days: number | null;
          goal_type: "daily_usage" | "milestone" | "community" | null;
          goal_value: number | null;
          reward_text: string | null;
          sponsor_message: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      challenge_participants: {
        Row: {
          id: string;
          challenge_id: string;
          user_id: string;
          progress: number;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
      };
      comments: {
        Row: {
          id: string;
          page_id: string;
          user_id: string;
          parent_id: string | null;
          content: string;
          created_at: string;
        };
      };
      page_likes: {
        Row: {
          page_id: string;
          user_id: string;
          created_at: string;
        };
      };
      follows: {
        Row: {
          follower_id: string;
          following_id: string;
          created_at: string;
        };
      };
      feedback: {
        Row: {
          id: string;
          page_id: string;
          user_id: string;
          rating: number;
          custom_message: string | null;
          usage_minutes: number | null;
          created_at: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          badge_type: string;
          earned_at: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          id: string;
          name: string;
          public: boolean;
          avif_autodetection: boolean;
          file_size_limit: number | null;
          allowed_mime_types: string[] | null;
          created_at: string;
          updated_at: string;
        };
      };
      objects: {
        Row: {
          id: string;
          bucket_id: string;
          name: string;
          owner: string | null;
          owner_id: string | null;
          version: string;
          created_at: string;
          updated_at: string;
          last_accessed_at: string;
          metadata: Json;
          path_tokens: string[];
        };
      };
    };
  };
}

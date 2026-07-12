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
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          bio: string | null;
          role: "developer" | "user" | "sponsor";
          points: number;
          level: number;
          created_at: string;
        };
      };
      pages: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          description: string | null;
          category: string | null;
          file_url: string;
          is_open_source: boolean;
          source_code: string | null;
          views: number;
          average_rating: number;
          created_at: string;
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
          goal_type: string | null;
          goal_value: number | null;
          reward_text: string | null;
          sponsor_message: string | null;
          is_active: boolean;
          created_at: string;
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
        };
      };
      follows: {
        Row: {
          follower_id: string;
          following_id: string;
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
      feedback: {
        Row: {
          id: string;
          page_id: string;
          user_id: string;
          rating: number;
          preset_answers: Json | null;
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
  };
}

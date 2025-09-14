import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      recipes: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          ingredients: string[];
          cooking_steps: string;
          category: 'vegetarian' | 'non-vegetarian' | 'dessert' | 'appetizer' | 'main-course' | 'beverage';
          prep_time: number | null;
          cook_time: number | null;
          servings: number | null;
          difficulty: 'easy' | 'medium' | 'hard' | null;
          image_url: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          ingredients: string[];
          cooking_steps: string;
          category: 'vegetarian' | 'non-vegetarian' | 'dessert' | 'appetizer' | 'main-course' | 'beverage';
          prep_time?: number | null;
          cook_time?: number | null;
          servings?: number | null;
          difficulty?: 'easy' | 'medium' | 'hard' | null;
          image_url?: string | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          ingredients?: string[];
          cooking_steps?: string;
          category?: 'vegetarian' | 'non-vegetarian' | 'dessert' | 'appetizer' | 'main-course' | 'beverage';
          prep_time?: number | null;
          cook_time?: number | null;
          servings?: number | null;
          difficulty?: 'easy' | 'medium' | 'hard' | null;
          image_url?: string | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      recipe_likes: {
        Row: {
          id: string;
          recipe_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      recipe_favorites: {
        Row: {
          id: string;
          recipe_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
  };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Recipe = Database['public']['Tables']['recipes']['Row'] & {
  profiles?: Profile;
  recipe_likes?: { count: number }[];
  is_liked?: boolean;
  is_favorited?: boolean;
};
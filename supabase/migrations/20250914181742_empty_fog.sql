/*
# Recipe Sharing App Database Schema

1. New Tables
   - `profiles`
     - `id` (uuid, references auth.users)
     - `full_name` (text)
     - `avatar_url` (text, optional)
     - `bio` (text, optional)
     - `created_at` (timestamp)
     - `updated_at` (timestamp)
   
   - `recipes` 
     - `id` (uuid, primary key)
     - `title` (text, required)
     - `description` (text, optional)
     - `ingredients` (jsonb array)
     - `cooking_steps` (text, required)
     - `category` (text, required)
     - `prep_time` (integer, minutes)
     - `cook_time` (integer, minutes)
     - `servings` (integer)
     - `difficulty` (text)
     - `image_url` (text, optional)
     - `user_id` (uuid, references profiles)
     - `created_at` (timestamp)
     - `updated_at` (timestamp)

   - `recipe_likes`
     - `id` (uuid, primary key)  
     - `recipe_id` (uuid, references recipes)
     - `user_id` (uuid, references profiles)
     - `created_at` (timestamp)

   - `recipe_favorites`
     - `id` (uuid, primary key)
     - `recipe_id` (uuid, references recipes) 
     - `user_id` (uuid, references profiles)
     - `created_at` (timestamp)

2. Security
   - Enable RLS on all tables
   - Policies for authenticated users to manage their own data
   - Public read access for recipes
   - User-specific access for profiles, likes, and favorites

3. Functions
   - Auto-create profile on user signup
   - Update timestamps on record updates
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  cooking_steps text NOT NULL,
  category text NOT NULL CHECK (category IN ('vegetarian', 'non-vegetarian', 'dessert', 'appetizer', 'main-course', 'beverage')),
  prep_time integer,
  cook_time integer,
  servings integer,
  difficulty text CHECK (difficulty IN ('easy', 'medium', 'hard')),
  image_url text,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create recipe_likes table
CREATE TABLE IF NOT EXISTS recipe_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(recipe_id, user_id)
);

-- Create recipe_favorites table  
CREATE TABLE IF NOT EXISTS recipe_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(recipe_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_favorites ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Recipes policies
CREATE POLICY "Recipes are viewable by everyone"
  ON recipes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Recipe likes policies
CREATE POLICY "Recipe likes are viewable by everyone"
  ON recipe_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like recipes"
  ON recipe_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes"
  ON recipe_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Recipe favorites policies
CREATE POLICY "Recipe favorites are viewable by owner"
  ON recipe_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can favorite recipes"
  ON recipe_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON recipe_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating timestamps
CREATE TRIGGER handle_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER handle_recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS recipes_user_id_idx ON recipes(user_id);
CREATE INDEX IF NOT EXISTS recipes_category_idx ON recipes(category);
CREATE INDEX IF NOT EXISTS recipes_created_at_idx ON recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS recipe_likes_recipe_id_idx ON recipe_likes(recipe_id);
CREATE INDEX IF NOT EXISTS recipe_favorites_user_id_idx ON recipe_favorites(user_id);
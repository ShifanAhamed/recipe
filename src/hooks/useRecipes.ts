import { useState, useEffect } from 'react';
import { supabase, Recipe } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchRecipes = async (filters?: {
    category?: string;
    search?: string;
    userId?: string;
  }) => {
    try {
      setLoading(true);
      let query = supabase
        .from('recipes')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          ),
          recipe_likes (count)
        `)
        .order('created_at', { ascending: false });

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,cooking_steps.ilike.%${filters.search}%`
        );
      }

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch user's likes and favorites if logged in
      let recipesWithUserData = data || [];

      if (user) {
        const recipeIds = recipesWithUserData.map(recipe => recipe.id);

        const [likesResponse, favoritesResponse] = await Promise.all([
          supabase
            .from('recipe_likes')
            .select('recipe_id')
            .eq('user_id', user.id)
            .in('recipe_id', recipeIds),
          supabase
            .from('recipe_favorites')
            .select('recipe_id')
            .eq('user_id', user.id)
            .in('recipe_id', recipeIds)
        ]);

        const likedRecipeIds = new Set(likesResponse.data?.map(like => like.recipe_id) || []);
        const favoritedRecipeIds = new Set(favoritesResponse.data?.map(fav => fav.recipe_id) || []);

        recipesWithUserData = recipesWithUserData.map(recipe => ({
          ...recipe,
          is_liked: likedRecipeIds.has(recipe.id),
          is_favorited: favoritedRecipeIds.has(recipe.id)
        }));
      }

      setRecipes(recipesWithUserData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createRecipe = async (recipeData: Omit<Recipe, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User must be logged in');

    const { data, error } = await supabase
      .from('recipes')
      .insert({
        ...recipeData,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  };

  const updateRecipe = async (id: string, recipeData: Partial<Recipe>) => {
    const { data, error } = await supabase
      .from('recipes')
      .update(recipeData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  };

  const deleteRecipe = async (id: string) => {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const toggleLike = async (recipeId: string) => {
    if (!user) throw new Error('User must be logged in');

    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    if (recipe.is_liked) {
      const { error } = await supabase
        .from('recipe_likes')
        .delete()
        .eq('recipe_id', recipeId)
        .eq('user_id', user.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('recipe_likes')
        .insert({ recipe_id: recipeId, user_id: user.id });

      if (error) throw error;
    }

    // Update local state
    setRecipes(prev => prev.map(r => 
      r.id === recipeId ? { ...r, is_liked: !r.is_liked } : r
    ));
  };

  const toggleFavorite = async (recipeId: string) => {
    if (!user) throw new Error('User must be logged in');

    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    if (recipe.is_favorited) {
      const { error } = await supabase
        .from('recipe_favorites')
        .delete()
        .eq('recipe_id', recipeId)
        .eq('user_id', user.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('recipe_favorites')
        .insert({ recipe_id: recipeId, user_id: user.id });

      if (error) throw error;
    }

    // Update local state
    setRecipes(prev => prev.map(r => 
      r.id === recipeId ? { ...r, is_favorited: !r.is_favorited } : r
    ));
  };

  useEffect(() => {
    fetchRecipes();
  }, [user]);

  return {
    recipes,
    loading,
    error,
    fetchRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    toggleLike,
    toggleFavorite
  };
};
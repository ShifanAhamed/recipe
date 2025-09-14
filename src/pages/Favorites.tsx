import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Navbar } from '../components/Layout/Navbar';
import { RecipeCard } from '../components/Recipe/RecipeCard';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Recipe } from '../lib/supabase';

export const Favorites: React.FC = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recipe_favorites')
        .select(`
          recipes (
            *,
            profiles:user_id (
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const favoriteRecipes = data.map(item => ({
        ...item.recipes,
        is_favorited: true
      })) as Recipe[];

      setFavorites(favoriteRecipes);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (recipeId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('recipe_favorites')
        .delete()
        .eq('recipe_id', recipeId)
        .eq('user_id', user.id);

      setFavorites(prev => prev.filter(recipe => recipe.id !== recipeId));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  const handleToggleLike = async (recipeId: string) => {
    if (!user) return;

    const recipe = favorites.find(r => r.id === recipeId);
    if (!recipe) return;

    try {
      if (recipe.is_liked) {
        await supabase
          .from('recipe_likes')
          .delete()
          .eq('recipe_id', recipeId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('recipe_likes')
          .insert({ recipe_id: recipeId, user_id: user.id });
      }

      setFavorites(prev => prev.map(r => 
        r.id === recipeId ? { ...r, is_liked: !r.is_liked } : r
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your favorites</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Heart size={32} className="text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
          </div>
          <p className="text-gray-600">
            All the recipes you've saved for later cooking adventures
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💝</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-600">
              Start exploring recipes and save your favorites by clicking the bookmark icon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onLike={handleToggleLike}
                onFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
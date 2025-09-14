import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Users, ChefHat, Heart, Bookmark, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { supabase, Recipe } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Layout/Navbar';

const categoryColors = {
  'vegetarian': 'bg-green-100 text-green-800',
  'non-vegetarian': 'bg-red-100 text-red-800',
  'dessert': 'bg-pink-100 text-pink-800',
  'appetizer': 'bg-blue-100 text-blue-800',
  'main-course': 'bg-purple-100 text-purple-800',
  'beverage': 'bg-yellow-100 text-yellow-800'
};

const difficultyColors = {
  'easy': 'text-green-600',
  'medium': 'text-orange-600',
  'hard': 'text-red-600'
};

export const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (id) {
      fetchRecipe(id);
    }
  }, [id, user]);

  const fetchRecipe = async (recipeId: string) => {
    try {
      setLoading(true);
      
      // Fetch recipe with author details
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            bio
          )
        `)
        .eq('id', recipeId)
        .single();

      if (recipeError) throw recipeError;

      setRecipe(recipeData);

      // Fetch likes count
      const { count: likesCount } = await supabase
        .from('recipe_likes')
        .select('*', { count: 'exact' })
        .eq('recipe_id', recipeId);

      setLikesCount(likesCount || 0);

      // Check if user has liked or favorited this recipe
      if (user) {
        const [likesResponse, favoritesResponse] = await Promise.all([
          supabase
            .from('recipe_likes')
            .select('id')
            .eq('recipe_id', recipeId)
            .eq('user_id', user.id)
            .single(),
          supabase
            .from('recipe_favorites')
            .select('id')
            .eq('recipe_id', recipeId)
            .eq('user_id', user.id)
            .single()
        ]);

        setIsLiked(!!likesResponse.data);
        setIsFavorited(!!favoritesResponse.data);
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user || !recipe) return;

    try {
      if (isLiked) {
        await supabase
          .from('recipe_likes')
          .delete()
          .eq('recipe_id', recipe.id)
          .eq('user_id', user.id);
        
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await supabase
          .from('recipe_likes')
          .insert({ recipe_id: recipe.id, user_id: user.id });
        
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleFavorite = async () => {
    if (!user || !recipe) return;

    try {
      if (isFavorited) {
        await supabase
          .from('recipe_favorites')
          .delete()
          .eq('recipe_id', recipe.id)
          .eq('user_id', user.id);
        
        setIsFavorited(false);
      } else {
        await supabase
          .from('recipe_favorites')
          .insert({ recipe_id: recipe.id, user_id: user.id });
        
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDelete = async () => {
    if (!recipe || !user || recipe.user_id !== user.id) return;
    
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        const { error } = await supabase
          .from('recipes')
          .delete()
          .eq('id', recipe.id);

        if (error) throw error;

        navigate('/profile');
      } catch (error) {
        console.error('Error deleting recipe:', error);
        alert('Error deleting recipe. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-64 bg-gray-300 rounded-lg mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Recipe not found</h1>
          <p className="text-gray-600 mb-8">The recipe you're looking for doesn't exist or may have been removed.</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  const isOwner = user && recipe.user_id === user.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Recipe Header */}
          <div className="relative">
            {recipe.image_url ? (
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="w-full h-64 md:h-80 object-cover"
              />
            ) : (
              <div className="w-full h-64 md:h-80 bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center">
                <span className="text-orange-600 text-8xl">🍽️</span>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex space-x-2">
              {user && (
                <>
                  <button
                    onClick={handleLike}
                    className={`p-3 rounded-full backdrop-blur-sm transition-colors ${
                      isLiked
                        ? 'bg-red-500 text-white'
                        : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                    }`}
                  >
                    <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={handleFavorite}
                    className={`p-3 rounded-full backdrop-blur-sm transition-colors ${
                      isFavorited
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/80 text-gray-600 hover:bg-white hover:text-blue-500'
                    }`}
                  >
                    <Bookmark size={20} fill={isFavorited ? 'currentColor' : 'none'} />
                  </button>
                </>
              )}
              
              {isOwner && (
                <>
                  <Link
                    to={`/edit-recipe/${recipe.id}`}
                    className="p-3 bg-white/80 text-gray-600 rounded-full backdrop-blur-sm hover:bg-white hover:text-orange-500 transition-colors"
                  >
                    <Edit size={20} />
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="p-3 bg-white/80 text-gray-600 rounded-full backdrop-blur-sm hover:bg-white hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Category Badge */}
            <div className="absolute bottom-4 left-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                categoryColors[recipe.category] || 'bg-gray-100 text-gray-800'
              }`}>
                {recipe.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
          </div>

          {/* Recipe Content */}
          <div className="p-6 md:p-8">
            {/* Title and Meta */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {recipe.title}
              </h1>
              
              {recipe.description && (
                <p className="text-lg text-gray-600 mb-4">
                  {recipe.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                {totalTime > 0 && (
                  <div className="flex items-center space-x-2">
                    <Clock size={18} />
                    <span>{totalTime} minutes</span>
                  </div>
                )}
                {recipe.servings && (
                  <div className="flex items-center space-x-2">
                    <Users size={18} />
                    <span>{recipe.servings} servings</span>
                  </div>
                )}
                {recipe.difficulty && (
                  <div className="flex items-center space-x-2">
                    <ChefHat size={18} />
                    <span className={`font-medium ${
                      difficultyColors[recipe.difficulty] || 'text-gray-600'
                    }`}>
                      {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
                    </span>
                  </div>
                )}
                {likesCount > 0 && (
                  <div className="flex items-center space-x-2">
                    <Heart size={18} className="text-red-500" />
                    <span>{likesCount} likes</span>
                  </div>
                )}
              </div>
            </div>

            {/* Author Info */}
            {recipe.profiles && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  {recipe.profiles.avatar_url ? (
                    <img
                      src={recipe.profiles.avatar_url}
                      alt={recipe.profiles.full_name || 'Author'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-medium text-lg">
                        {recipe.profiles.full_name?.charAt(0) || 'A'}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {recipe.profiles.full_name || 'Anonymous Chef'}
                    </h3>
                    {recipe.profiles.bio && (
                      <p className="text-sm text-gray-600">{recipe.profiles.bio}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      Recipe created on {new Date(recipe.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recipe Details */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Ingredients */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ingredients</h2>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cooking Steps */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Instructions</h2>
                <div className="prose prose-gray max-w-none">
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {recipe.cooking_steps}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
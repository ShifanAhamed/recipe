import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Heart, Bookmark } from 'lucide-react';
import { Recipe } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface RecipeCardProps {
  recipe: Recipe;
  onLike?: (recipeId: string) => void;
  onFavorite?: (recipeId: string) => void;
}

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

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onLike, onFavorite }) => {
  const { user } = useAuth();

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user && onLike) {
      onLike(recipe.id);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user && onFavorite) {
      onFavorite(recipe.id);
    }
  };

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <Link to={`/recipe/${recipe.id}`} className="block group">
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        {/* Recipe Image */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          {recipe.image_url ? (
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center">
              <span className="text-orange-600 text-6xl">🍽️</span>
            </div>
          )}
          
          {/* Action buttons overlay */}
          {user && (
            <div className="absolute top-3 right-3 flex space-x-2">
              <button
                onClick={handleLike}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                  recipe.is_liked
                    ? 'bg-red-500 text-white'
                    : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                }`}
              >
                <Heart size={18} fill={recipe.is_liked ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={handleFavorite}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                  recipe.is_favorited
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/80 text-gray-600 hover:bg-white hover:text-blue-500'
                }`}
              >
                <Bookmark size={18} fill={recipe.is_favorited ? 'currentColor' : 'none'} />
              </button>
            </div>
          )}

          {/* Category badge */}
          <div className="absolute bottom-3 left-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              categoryColors[recipe.category] || 'bg-gray-100 text-gray-800'
            }`}>
              {recipe.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
        </div>

        {/* Recipe Content */}
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
            {recipe.title}
          </h3>
          
          {recipe.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {recipe.description}
            </p>
          )}

          {/* Recipe Meta */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-4">
              {totalTime > 0 && (
                <div className="flex items-center space-x-1">
                  <Clock size={16} />
                  <span>{totalTime} min</span>
                </div>
              )}
              {recipe.servings && (
                <div className="flex items-center space-x-1">
                  <Users size={16} />
                  <span>{recipe.servings} servings</span>
                </div>
              )}
            </div>
            
            {recipe.difficulty && (
              <span className={`font-medium ${
                difficultyColors[recipe.difficulty] || 'text-gray-600'
              }`}>
                {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
              </span>
            )}
          </div>

          {/* Author */}
          {recipe.profiles && (
            <div className="flex items-center space-x-2">
              {recipe.profiles.avatar_url ? (
                <img
                  src={recipe.profiles.avatar_url}
                  alt={recipe.profiles.full_name || 'Author'}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-xs font-medium">
                    {recipe.profiles.full_name?.charAt(0) || 'A'}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-600">
                {recipe.profiles.full_name || 'Anonymous'}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
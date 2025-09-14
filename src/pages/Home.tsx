import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Layout/Navbar';
import { RecipeCard } from '../components/Recipe/RecipeCard';
import { useRecipes } from '../hooks/useRecipes';
import { Filter } from 'lucide-react';

const categories = [
  { value: 'all', label: 'All Recipes' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'non-vegetarian', label: 'Non-Vegetarian' },
  { value: 'dessert', label: 'Desserts' },
  { value: 'appetizer', label: 'Appetizers' },
  { value: 'main-course', label: 'Main Course' },
  { value: 'beverage', label: 'Beverages' }
];

export const Home: React.FC = () => {
  const { recipes, loading, fetchRecipes, toggleLike, toggleFavorite } = useRecipes();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRecipes({
      category: selectedCategory,
      search: searchTerm || undefined
    });
  }, [selectedCategory, searchTerm]);

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onSearchChange={handleSearchChange} searchValue={searchTerm} />
        <div className="max-w-7xl mx-auto px-4 py-8">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSearchChange={handleSearchChange} searchValue={searchTerm} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Discover Amazing Recipes
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Share your culinary creations and explore recipes from food lovers around the world
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedCategory === 'all' ? 'All Recipes' : 
             categories.find(cat => cat.value === selectedCategory)?.label}
          </h2>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors md:hidden"
          >
            <Filter size={20} />
            <span>Filter</span>
          </button>
        </div>

        {/* Category Filter */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:block mb-6`}>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-orange-50 border border-gray-300'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recipe Grid */}
        {recipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No recipes found</h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Try adjusting your search terms or explore different categories.'
                : 'Be the first to share a recipe in this category!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onLike={toggleLike}
                onFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
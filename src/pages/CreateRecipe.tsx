import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Layout/Navbar';
import { RecipeForm } from '../components/Recipe/RecipeForm';
import { useRecipes } from '../hooks/useRecipes';

export const CreateRecipe: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { createRecipe } = useRecipes();
  const navigate = useNavigate();

  const handleSubmit = async (recipeData: any) => {
    try {
      setLoading(true);
      const newRecipe = await createRecipe(recipeData);
      navigate(`/recipe/${newRecipe.id}`);
    } catch (error) {
      console.error('Error creating recipe:', error);
      alert('Error creating recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Recipe</h1>
          <p className="text-gray-600">
            Share your favorite recipe with the community. Fill out the form below with all the delicious details!
          </p>
        </div>

        <RecipeForm
          onSubmit={handleSubmit}
          submitText="Create Recipe"
          loading={loading}
        />
      </div>
    </div>
  );
};
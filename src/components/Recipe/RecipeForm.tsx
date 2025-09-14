import React, { useState } from 'react';
import { Plus, X, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface RecipeFormData {
  title: string;
  description: string;
  ingredients: string[];
  cooking_steps: string;
  category: 'vegetarian' | 'non-vegetarian' | 'dessert' | 'appetizer' | 'main-course' | 'beverage';
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  image_url?: string;
}

interface RecipeFormProps {
  initialData?: Partial<RecipeFormData>;
  onSubmit: (data: RecipeFormData) => Promise<void>;
  submitText?: string;
  loading?: boolean;
}

export const RecipeForm: React.FC<RecipeFormProps> = ({
  initialData = {},
  onSubmit,
  submitText = 'Create Recipe',
  loading = false
}) => {
  const [formData, setFormData] = useState<RecipeFormData>({
    title: initialData.title || '',
    description: initialData.description || '',
    ingredients: initialData.ingredients || [''],
    cooking_steps: initialData.cooking_steps || '',
    category: initialData.category || 'vegetarian',
    prep_time: initialData.prep_time || 0,
    cook_time: initialData.cook_time || 0,
    servings: initialData.servings || 1,
    difficulty: initialData.difficulty || 'easy',
    image_url: initialData.image_url || undefined
  });
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty ingredients
    const cleanedData = {
      ...formData,
      ingredients: formData.ingredients.filter(ingredient => ingredient.trim() !== '')
    };

    await onSubmit(cleanedData);
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) => 
        i === index ? value : ingredient
      )
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `recipe-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('recipe-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        image_url: publicUrl
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Recipe Title *
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            placeholder="Enter recipe title..."
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            placeholder="Brief description of your recipe..."
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipe Image
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors">
              <Upload size={20} className="text-gray-500" />
              <span className="text-sm text-gray-700">
                {uploading ? 'Uploading...' : 'Choose Image'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            {formData.image_url && (
              <img
                src={formData.image_url}
                alt="Recipe preview"
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
          </div>
        </div>

        {/* Category and Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              required
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                category: e.target.value as RecipeFormData['category']
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            >
              <option value="vegetarian">Vegetarian</option>
              <option value="non-vegetarian">Non-Vegetarian</option>
              <option value="dessert">Dessert</option>
              <option value="appetizer">Appetizer</option>
              <option value="main-course">Main Course</option>
              <option value="beverage">Beverage</option>
            </select>
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty *
            </label>
            <select
              id="difficulty"
              required
              value={formData.difficulty}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                difficulty: e.target.value as RecipeFormData['difficulty']
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Timing and Servings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="prep_time" className="block text-sm font-medium text-gray-700 mb-2">
              Prep Time (min)
            </label>
            <input
              type="number"
              id="prep_time"
              min="0"
              value={formData.prep_time}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                prep_time: parseInt(e.target.value) || 0
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>

          <div>
            <label htmlFor="cook_time" className="block text-sm font-medium text-gray-700 mb-2">
              Cook Time (min)
            </label>
            <input
              type="number"
              id="cook_time"
              min="0"
              value={formData.cook_time}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                cook_time: parseInt(e.target.value) || 0
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>

          <div>
            <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-2">
              Servings *
            </label>
            <input
              type="number"
              id="servings"
              min="1"
              required
              value={formData.servings}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                servings: parseInt(e.target.value) || 1
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Ingredients *
            </label>
            <button
              type="button"
              onClick={addIngredient}
              className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 transition-colors"
            >
              <Plus size={16} />
              <span className="text-sm">Add Ingredient</span>
            </button>
          </div>
          <div className="space-y-2">
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => updateIngredient(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder={`Ingredient ${index + 1}`}
                  required={index === 0}
                />
                {formData.ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="p-2 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Cooking Steps */}
        <div>
          <label htmlFor="cooking_steps" className="block text-sm font-medium text-gray-700 mb-2">
            Cooking Steps *
          </label>
          <textarea
            id="cooking_steps"
            required
            value={formData.cooking_steps}
            onChange={(e) => setFormData(prev => ({ ...prev, cooking_steps: e.target.value }))}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            placeholder="Describe the cooking steps in detail..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || uploading}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Saving...' : submitText}
          </button>
        </div>
      </div>
    </form>
  );
};
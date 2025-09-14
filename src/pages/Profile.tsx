import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Calendar, Plus, Edit } from 'lucide-react';
import { Navbar } from '../components/Layout/Navbar';
import { RecipeCard } from '../components/Recipe/RecipeCard';
import { useAuth } from '../contexts/AuthContext';
import { useRecipes } from '../hooks/useRecipes';

export const Profile: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const { recipes, loading, fetchRecipes, toggleLike, toggleFavorite } = useRecipes();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || ''
  });

  useEffect(() => {
    if (user) {
      fetchRecipes({ userId: user.id });
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setEditData({
        full_name: profile.full_name || '',
        bio: profile.bio || ''
      });
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile</h1>
          <Link
            to="/login"
            className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-6">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-orange-200 rounded-full flex items-center justify-center">
                  <User size={32} className="text-orange-600" />
                </div>
              )}
              
              <div className="flex-1">
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        value={editData.full_name}
                        onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                        className="text-2xl font-bold bg-transparent border-b-2 border-orange-300 focus:border-orange-500 outline-none"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <textarea
                        value={editData.bio}
                        onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        rows={3}
                        placeholder="Tell us about yourself and your cooking style..."
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {profile?.full_name || 'Anonymous Chef'}
                    </h1>
                    {profile?.bio ? (
                      <p className="text-gray-600 mb-3">{profile.bio}</p>
                    ) : (
                      <p className="text-gray-500 italic mb-3">No bio added yet</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar size={16} />
                        <span>
                          Joined {new Date(profile?.created_at || '').toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{recipes.length}</span> recipes shared
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-orange-600 border border-gray-300 rounded-lg hover:border-orange-300 transition-colors"
              >
                <Edit size={16} />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Recipes Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Recipes</h2>
            <Link
              to="/create"
              className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus size={20} />
              <span>Create Recipe</span>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
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
          ) : recipes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <div className="text-6xl mb-4">👨‍🍳</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No recipes yet</h3>
              <p className="text-gray-600 mb-6">
                Start sharing your culinary creations with the community!
              </p>
              <Link
                to="/create"
                className="inline-flex items-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus size={20} />
                <span>Create Your First Recipe</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
};
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, Search, User, Plus, Heart, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  onSearchChange?: (search: string) => void;
  searchValue?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearchChange, searchValue = '' }) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-orange-600 font-bold text-xl">
            <ChefHat size={28} />
            <span className="hidden sm:block">RecipeShare</span>
          </Link>

          {/* Search Bar - Desktop */}
          {onSearchChange && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search recipes or ingredients..."
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/create"
                  className="flex items-center space-x-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Plus size={20} />
                  <span>Create Recipe</span>
                </Link>
                <Link
                  to="/favorites"
                  className="p-2 text-gray-600 hover:text-orange-600 transition-colors"
                  title="Favorites"
                >
                  <Heart size={24} />
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors"
                >
                  <User size={24} />
                  <span className="font-medium">{profile?.full_name || 'Profile'}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={24} />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-orange-600 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-gray-600 hover:text-orange-600 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Search Bar */}
        {onSearchChange && (
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-3">
            {user ? (
              <>
                <Link
                  to="/create"
                  className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors py-2"
                  onClick={toggleMenu}
                >
                  <Plus size={20} />
                  <span>Create Recipe</span>
                </Link>
                <Link
                  to="/favorites"
                  className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors py-2"
                  onClick={toggleMenu}
                >
                  <Heart size={20} />
                  <span>Favorites</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors py-2"
                  onClick={toggleMenu}
                >
                  <User size={20} />
                  <span>{profile?.full_name || 'Profile'}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors py-2 w-full text-left"
                >
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-gray-600 hover:text-orange-600 transition-colors py-2"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-center"
                  onClick={toggleMenu}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
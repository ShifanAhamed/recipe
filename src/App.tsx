import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Home } from './pages/Home';
import { RecipeDetail } from './pages/RecipeDetail';
import { CreateRecipe } from './pages/CreateRecipe';
import { Profile } from './pages/Profile';
import { Favorites } from './pages/Favorites';
import { Login } from './pages/Auth/Login';
import { Signup } from './pages/Auth/Signup';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/create" 
              element={
                <ProtectedRoute>
                  <CreateRecipe />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/favorites" 
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
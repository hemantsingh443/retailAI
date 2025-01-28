// components/Navigation.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const Navigation = ({ isLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            AI Chatbot
          </Link>
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-indigo-600 transition duration-300"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-indigo-600 transition duration-300"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};


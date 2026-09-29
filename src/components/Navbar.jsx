import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, LogOut, Shield, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { user, profile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-blue-600 font-bold text-xl tracking-tight">
              <Calendar className="h-7 w-7" />
              <span>EventQA</span>
            </Link>
            <div className="hidden md:flex ml-10 space-x-6 text-sm font-medium text-gray-700">
              <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
              <Link to="/events" className="hover:text-blue-600 transition-colors">Events</Link>
              {user && (
                <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="flex items-center text-purple-600 hover:text-purple-700 font-semibold transition-colors">
                  <Shield className="h-4 w-4 mr-1" />
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Desktop Right Side / Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 font-medium">
                  {profile?.full_name || user.email}
                  {isAdmin && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">
                      Admin
                    </span>
                  )}
                </span>
                <button
                  id="logout-button"
                  data-testid="logout-button"
                  onClick={handleLogout}
                  className="inline-flex items-center px-3.5 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1.5 text-gray-500" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs hover:shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-500 hover:text-gray-700 p-2"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 px-4 pt-2 pb-4 space-y-2 bg-white">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-gray-700 hover:text-blue-600"
          >
            Home
          </Link>
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-gray-700 hover:text-blue-600"
          >
            Events
          </Link>
          {user && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-gray-700 hover:text-blue-600"
            >
              Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-purple-600 hover:text-purple-700"
            >
              Admin Panel
            </Link>
          )}
          <div className="pt-2 border-t border-gray-100">
            {user ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 font-medium px-1">
                  Signed in as: {profile?.full_name || user.email}
                </p>
                <button
                  id="logout-button-mobile"
                  data-testid="logout-button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 px-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 px-3 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

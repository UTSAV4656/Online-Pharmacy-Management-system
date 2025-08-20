import React, { useState } from 'react';
import {
  Bell,
  Search,
  User,
  ChevronDown,
  ShoppingCart,
  LogOut,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import { useCart } from '../Cart/CartContext';

interface HeaderProps {
  currentPage: string;
  userRole: string;
  userName: string;
  onLogout: () => void;
  onCartClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  currentPage,
  userRole,
  userName,
  onLogout,
  onCartClick
}) => {
  const { state } = useCart();
  const [showMenu, setShowMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <header
      className={`${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      } border-b border-gray-200 px-6 py-4 shadow-sm transition-colors`}
    >
      <div className="flex items-center justify-between">
        {/* Left Section - Page Title */}
        <div>
          <h1 className="text-2xl font-bold capitalize">
            {currentPage === 'dashboard' ? 'Dashboard' : currentPage}
          </h1>
          <p
            className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            Welcome back, <span className="font-medium">{userName}</span>
          </p>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search medicines, orders..."
              className={`pl-10 pr-4 py-2 w-64 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                darkMode
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300'
              }`}
            />
          </div>

          {/* Notification Bell */}
          <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <Bell className="w-6 h-6 text-gray-500 hover:text-teal-500 transition-colors" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* Cart Button for Customers */}
          {userRole === 'Customer' && (
            <button
              onClick={onCartClick}
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <ShoppingCart className="w-6 h-6 text-gray-500 hover:text-teal-500 transition-transform" />
              {state.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {state.itemCount}
                </span>
              )}
            </button>
          )}

          {/* Dark/Light Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm text-left hidden sm:block">
                <p className="font-medium">{userName}</p>
                <p
                  className={`text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {userRole}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div
                className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${
                  darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                }`}
              >
                <button className="flex items-center w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-red-500"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

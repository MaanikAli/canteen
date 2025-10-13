import React from 'react';
import { User, UserRole } from '../types';

const LeafIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface HeaderProps {
  canteenName: string;
  cartCount: number;
  onCartClick: () => void;
  currentUser: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ canteenName, cartCount, onCartClick, currentUser, onLogout, onNavigate }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <button onClick={() => onNavigate('home')} className="flex items-center space-x-2">
          <LeafIcon />
          <h1 className="text-2xl font-bold text-gray-800">{canteenName}</h1>
        </button>
        <nav className="hidden md:flex space-x-6 items-center">
          <button onClick={() => onNavigate('home')} className="text-gray-600 hover:text-primary transition duration-300">Home</button>
          
          {currentUser?.role === UserRole.Admin && <button onClick={() => onNavigate('admin')} className="text-gray-600 hover:text-primary transition duration-300">Admin Panel</button>}
          {currentUser?.role === UserRole.Kitchen && <button onClick={() => onNavigate('kitchen')} className="text-gray-600 hover:text-primary transition duration-300">Kitchen View</button>}
          
          {currentUser && (
            <>
              <a href="#menu" className="text-gray-600 hover:text-primary transition duration-300">Menu</a>
              <a href="#offers" className="text-gray-600 hover:text-primary transition duration-300">Offers</a>
            </>
          )}

          {currentUser ? (
             <div className="flex items-center space-x-4">
               <button onClick={() => onNavigate('profile')} className="text-gray-600 hover:text-primary transition duration-300">Profile</button>
               <button onClick={onLogout} className="bg-red-500 text-white px-3 py-1 rounded-md text-sm font-semibold hover:bg-red-600 transition-colors">Logout</button>
             </div>
          ) : (
             <div className="flex items-center space-x-4">
               <button onClick={() => onNavigate('login')} className="text-gray-600 hover:text-primary transition duration-300">Sign In</button>
               <button onClick={() => onNavigate('signup')} className="bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors">Sign Up</button>
             </div>
          )}

          {currentUser && cartCount > 0 && (
            <button onClick={onCartClick} className="relative text-gray-600 hover:text-primary transition duration-300" aria-label={`Open cart with ${cartCount} items`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-secondary text-gray-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            </button>
          )}

        </nav>
      </div>
    </header>
  );
};

export default Header;
import React from 'react';
import { Link } from 'react-router-dom';
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
}

const Header: React.FC<HeaderProps> = ({ canteenName, cartCount, onCartClick, currentUser, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <LeafIcon />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{canteenName}</h1>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-4 lg:space-x-6 items-center">
            <Link to="/" className="text-gray-600 hover:text-primary transition duration-300 text-sm lg:text-base">Home</Link>

            {currentUser?.role === UserRole.Admin && <Link to="/admin" className="text-gray-600 hover:text-primary transition duration-300 text-sm lg:text-base">Admin Panel</Link>}
            {currentUser?.role === UserRole.Kitchen && <Link to="/kitchen" className="text-gray-600 hover:text-primary transition duration-300 text-sm lg:text-base">Kitchen</Link>}

            {currentUser && (
              <>
                <a href="#menu" className="text-gray-600 hover:text-primary transition duration-300 text-sm lg:text-base">Menu</a>
                <a href="#offers" className="text-gray-600 hover:text-primary transition duration-300 text-sm lg:text-base">Offers</a>
                <Link to="/orders" className="text-gray-600 hover:text-primary transition duration-300 text-sm lg:text-base">Orders</Link>
              </>
            )}

            {currentUser ? (
               <div className="flex items-center space-x-2 lg:space-x-4">
                 <Link to="/profile" className="text-gray-600 hover:text-primary transition duration-300 text-sm lg:text-base">Profile</Link>
                 <button onClick={onLogout} className="bg-red-500 text-white px-2 lg:px-3 py-1 rounded-md text-xs lg:text-sm font-semibold hover:bg-red-600 transition-colors">Logout</button>
               </div>
            ) : (
               <div className="flex items-center space-x-2 lg:space-x-4">
                 <Link to="/login" className="text-gray-600 hover:text-primary transition duration-300 text-sm lg:text-base">Sign In</Link>
                 <Link to="/signup" className="bg-primary text-white px-3 lg:px-4 py-2 rounded-full text-xs lg:text-sm font-semibold hover:bg-primary-dark transition-colors">Sign Up</Link>
               </div>
            )}

            {currentUser && cartCount > 0 && (
              <button onClick={onCartClick} className="relative text-gray-600 hover:text-primary transition duration-300" aria-label={`Open cart with ${cartCount} items`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 lg:h-7 w-6 lg:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="absolute -top-2 -right-2 bg-secondary text-gray-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              </button>
            )}
          </nav>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col space-y-3">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-left text-gray-600 hover:text-primary transition duration-300">Home</Link>

              {currentUser?.role === UserRole.Admin && <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-left text-gray-600 hover:text-primary transition duration-300">Admin Panel</Link>}
              {currentUser?.role === UserRole.Kitchen && <Link to="/kitchen" onClick={() => setIsMenuOpen(false)} className="text-left text-gray-600 hover:text-primary transition duration-300">Kitchen</Link>}

              {currentUser && (
                <>
                  <a href="#menu" onClick={() => setIsMenuOpen(false)} className="text-left text-gray-600 hover:text-primary transition duration-300">Menu</a>
                  <a href="#offers" onClick={() => setIsMenuOpen(false)} className="text-left text-gray-600 hover:text-primary transition duration-300">Offers</a>
                  <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="text-left text-gray-600 hover:text-primary transition duration-300">Orders</Link>
                </>
              )}

              <div className="border-t border-gray-200 pt-3 flex flex-col space-y-3">
                {currentUser ? (
                  <>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="text-left text-gray-600 hover:text-primary transition duration-300">Profile</Link>
                    <button onClick={onLogout} className="text-left bg-red-500 text-white px-3 py-2 rounded-md text-sm font-semibold hover:bg-red-600 transition-colors w-fit">Logout</button>
                  </>
                ) : (
                  <div className="flex space-x-3">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-left text-gray-600 hover:text-primary transition duration-300">Sign In</Link>
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="text-left bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors">Sign Up</Link>
                  </div>
                )}

                {currentUser && cartCount > 0 && (
                  <button onClick={() => { onCartClick(); setIsMenuOpen(false); }} className="flex items-center space-x-2 text-gray-600 hover:text-primary transition duration-300 w-fit" aria-label={`Open cart with ${cartCount} items`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="bg-secondary text-gray-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                      {cartCount}
                    </span>
                    <span>Cart ({cartCount})</span>
                  </button>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
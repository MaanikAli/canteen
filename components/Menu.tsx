import React, { useState, useEffect } from 'react';
import { MenuCategory, MenuItem } from '../types';
import { apiService } from '../services/apiService';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToCart }) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col">
    <img src={item.imageUrl} alt={item.name} className="w-full h-48 object-cover" />
    <div className="p-6 flex flex-col flex-grow">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h3>
        <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full flex-shrink-0">{item.category}</span>
      </div>
      <p className="text-gray-600 text-sm mb-4 flex-grow">{item.description}</p>
      <div className="flex justify-between items-center mt-auto">
        <div className="flex flex-col">
          {item.discountPercent && item.discountPercent > 0 ? (
            <>
              <span className="text-lg font-bold text-primary">৳{(item.price - (item.price * (item.discountPercent / 100))).toFixed(2)}</span>
              <span className="text-sm text-gray-400 line-through">৳{item.price.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-lg font-bold text-primary">৳{item.price.toFixed(2)}</span>
          )}
          <span className="text-xs text-gray-500">Stock: {item.stockQuantity || 0}</span>
        </div>
        <button
          onClick={() => onAddToCart(item)}
          disabled={(item.stockQuantity || 0) <= 0}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 flex items-center gap-1 ${
            (item.stockQuantity || 0) <= 0
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-dark'
          }`}
          aria-label={`Add ${item.name} to cart`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add
        </button>
      </div>
    </div>
  </div>
);

interface MenuProps {
  menu: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
}

const Menu: React.FC<MenuProps> = ({ menu, onAddToCart }) => {
  const [activeCategory, setActiveCategory] = useState<MenuCategory | 'All'>('All');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const categories: ('All' | MenuCategory)[] = ['All', ...Object.values(MenuCategory)];

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await apiService.getMenu();
        setMenuItems(data);
      } catch (error) {
        console.error('Failed to fetch menu:', error);
      }
    };
    fetchMenu();
  }, []);

  const filteredItems = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <section id="menu" className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Our Delicious Menu</h2>
          <p className="text-gray-600 mt-2">Crafted with fresh ingredients to power your studies.</p>
        </div>

        <div className="flex justify-center flex-wrap gap-2 md:gap-4 mb-12">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 text-sm md:text-base font-semibold rounded-full transition-colors duration-300 ${
                activeCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map((item, index) => (
            <MenuItemCard key={item.id ?? index} item={item} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Menu;
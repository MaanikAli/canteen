import React from 'react';
import { MenuItem } from '../types';

interface OfferCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

const OfferCard: React.FC<OfferCardProps> = ({ item, onAddToCart }) => {
  const discountAmount = item.price * ((item.discountPercent || 0) / 100);
  const discountedPrice = item.price - discountAmount;

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden group">
      <div className="relative">
        <img src={item.imageUrl} alt={item.name} className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute top-0 right-0 bg-secondary text-gray-900 font-bold px-4 py-2 m-4 rounded-full">
          Save ৳{discountAmount.toFixed(2)}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{item.name}</h3>
        <p className="text-gray-600 mb-4">{item.description}</p>
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <p className="text-2xl font-bold text-primary">৳{discountedPrice.toFixed(2)}</p>
            {item.discountPercent && item.discountPercent > 0 && (
              <p className="text-lg text-gray-400 line-through">৳{item.price.toFixed(2)}</p>
            )}
          </div>
          <span className="text-sm text-gray-500">Stock: {item.stockQuantity || 0}</span>
        </div>
        <button
          onClick={() => onAddToCart(item)}
          disabled={(item.stockQuantity || 0) <= 0}
          className={`w-full px-6 py-3 rounded-full text-sm font-semibold transition-colors duration-300 flex items-center justify-center gap-2 ${
            (item.stockQuantity || 0) <= 0
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-dark'
          }`}
          aria-label={`Add ${item.name} to cart`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add
        </button>
      </div>
    </div>
  );
};

interface SpecialOffersProps {
  menu: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
}

const SpecialOffers: React.FC<SpecialOffersProps> = ({ menu, onAddToCart }) => {
  const specialItems = menu.filter(item => item.isSpecial);

  return (
    <section id="offers" className="py-16 bg-light">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Today's Special Offers</h2>
          <p className="text-gray-600 mt-2">Don't miss out on these amazing deals!</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {specialItems.map(item => (
            <OfferCard key={item.id} item={item} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialOffers;
import React from 'react';
import { MenuItem } from '../types';

interface OfferCardProps {
  item: MenuItem;
}

const OfferCard: React.FC<OfferCardProps> = ({ item }) => (
  <div className="bg-white rounded-lg shadow-xl overflow-hidden group">
    <div className="relative">
      <img src={item.imageUrl} alt={item.name} className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute top-0 right-0 bg-secondary text-gray-900 font-bold px-4 py-2 m-4 rounded-full">-20% OFF</div>
    </div>
    <div className="p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{item.name}</h3>
      <p className="text-gray-600 mb-4">{item.description}</p>
      <div className="flex items-baseline">
        <p className="text-2xl font-bold text-primary">৳{(item.price * 0.8).toFixed(2)}</p>
        <p className="text-lg text-gray-400 line-through">৳{item.price.toFixed(2)}</p>
      </div>
    </div>
  </div>
);

interface SpecialOffersProps {
  menu: MenuItem[];
}

const SpecialOffers: React.FC<SpecialOffersProps> = ({ menu }) => {
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
            <OfferCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialOffers;
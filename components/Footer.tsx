
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white mt-16">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h2 className="text-xl font-bold">Green University Canteen</h2>
            <p className="text-gray-400">123 University Avenue, Campus Town</p>
            <p className="text-gray-400">Open Mon-Fri, 8 AM - 6 PM</p>
          </div>
          <div className="text-center">
            <p>&copy; {new Date().getFullYear()} Green University Canteen. All Rights Reserved.</p>
            <p className="text-sm text-gray-500">Fueling Minds, One Healthy Meal at a Time.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

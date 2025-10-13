
import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <img src="https://picsum.photos/id/122/600/400" alt="Canteen Staff" className="rounded-lg shadow-lg" />
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              At Green University Canteen, we believe that good food is the foundation of a great education. Our mission is to provide students and faculty with delicious, affordable, and nutritious meals that are made from locally-sourced, sustainable ingredients whenever possible.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We're more than just a place to eat; we're a community hub where you can relax, socialize, and refuel for your busy day. Our team is passionate about creating a welcoming atmosphere and a menu that caters to diverse tastes and dietary needs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

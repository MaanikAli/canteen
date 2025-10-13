
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section id="home" className="relative h-[60vh] min-h-[400px] bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/id/1060/1600/900')" }}>
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-4">
        <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 tracking-wide">Fresh, Healthy, Delicious.</h2>
        <p className="text-lg md:text-xl max-w-2xl mb-8">Your on-campus destination for nutritious meals that taste as good as they feel.</p>
        <a href="#menu" className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105">
          See Today's Menu
        </a>
      </div>
    </section>
  );
};

export default Hero;

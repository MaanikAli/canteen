
import React, { useState, useEffect } from 'react';

const Hero: React.FC = () => {
  const images = [
    '/uploads/canteen1.jpg',
    '/uploads/canteen.png',
    '/uploads/canteen3.png',
    '/uploads/canteen4.png'
    
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <section id="home" className="relative h-[60vh] min-h-[400px] bg-cover bg-center" style={{ backgroundImage: `url('${images[currentImageIndex]}')` }}>
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-4">
        <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 tracking-wide">Fresh, Healthy, Delicious.</h2>
        <p className="text-lg md:text-xl max-w-2xl mb-8">Your on-campus destination for nutritious meals that taste as good as they feel.</p>
        <a href="/menu" className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105">
          See Today's Menu
        </a>
      </div>
      {/* Sliding Controls */}
      <button onClick={goToPrevious} className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition duration-300">
        &#10094;
      </button>
      <button onClick={goToNext} className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition duration-300">
        &#10095;
      </button>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition duration-300 ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;

import { useState } from "react";

export default function Carousel({ urls }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % urls.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + urls.length) % urls.length);
  };

  return (
    <div className="relative w-full h-full">
      <img
        src={urls[currentIndex]}
        alt={`Slide ${currentIndex}`}
        className="w-full h-full object-cover rounded-lg transition-transform duration-500 ease-in-out"
        onError={(e) => {
          e.target.onerror = null;
        }}
      />
      <button
        onClick={prevImage}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity duration-300 cursor-pointer"
      >
        &#9664;
      </button>
      <button
        onClick={nextImage}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity duration-300 cursor-pointer"
      >
        &#9654;
      </button>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {urls.map((_, index) => (
          <span
            key={index}
            className={`h-2 w-2 rounded-full ${
              index === currentIndex ? 'bg-white' : 'bg-gray-400'
            } cursor-pointer`}
            onClick={() => setCurrentIndex(index)}
          ></span>
        ))}
      </div>
    </div>
  );
}

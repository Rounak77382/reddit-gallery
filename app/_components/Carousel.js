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
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.onerror = null;
        }}
      />
      <button
        onClick={prevImage}
        className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-black bg-opacity-50 text-white border-none cursor-pointer"
      >
        &#9664;
      </button>
      <button
        onClick={nextImage}
        className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-black bg-opacity-50 text-white border-none cursor-pointer"
      >
        &#9654;
      </button>
    </div>
  );
}

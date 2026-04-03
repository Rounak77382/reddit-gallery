import { useAppContext } from "./AppContext";
import { useRef, forwardRef } from "react";

const SimpleImage = forwardRef(({ imageData }, ref) => {
  const { state } = useAppContext();
  const { isNSFWAllowed } = state;
  const containerRef = useRef(null);

  return (
    <div className="relative overflow-hidden h-full w-full" ref={containerRef}>
      {imageData.isNSFW && !isNSFWAllowed && (
        <div className="absolute top-2 right-2 z-30">
          <span className="bg-red-500/80 text-white px-2 py-1 rounded text-sm font-bold">
            NSFW
          </span>
        </div>
      )}
      <div className="relative h-full rounded-lg z-10 bg-[#000000] object-cover overflow-hidden flex justify-center items-center">
        <img
          ref={ref}
          src={imageData.url}
          alt={imageData.url || "Image"}
          className={`max-w-full max-h-full rounded-lg relative z-10 
          object-contain
          ${imageData.isNSFW && !isNSFWAllowed ? "blur-xl" : ""}
          `}
          onError={(e) => {
            e.target.onerror = null;
          }}
        />
      </div>
    </div>
  );
});

SimpleImage.displayName = "SimpleImage";

export default SimpleImage;

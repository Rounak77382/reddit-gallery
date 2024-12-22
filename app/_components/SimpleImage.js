
import { useAppContext } from "./Context";

export default function SimpleImage({ imageData }) {

  const { state } = useAppContext();
  const { isNSFWAllowed } = state;

  return (
    <div className="relative overflow-hidden w-full h-[400px] min-w-[275px] rounded-lg ">
      {imageData.isNSFW && !isNSFWAllowed && (
        <div className="absolute top-2 right-2 z-30">
          <span className="bg-red-500/80 text-white px-2 py-1 rounded text-sm font-bold">
            NSFW
          </span>
        </div>
      )}
      <img
        src={imageData.url}
        alt={imageData.url}
        className={`
          w-full h-[400px] min-w-[275px] 
          rounded-lg 
          transition-all ease duration-500 
          relative z-10 
          bg-[#000000] 
          object-cover
          ${imageData.isNSFW ? "blur-xl" : ""}
          ${isNSFWAllowed ? "blur-none" : ""}
        `}
        onError={(e) => {
          e.target.onerror = null;
        }}
      />
    </div>
  );
}

import { useAppContext } from "./Context";

export default function Video({ imageData }) {
  const { state } = useAppContext();
  const { isNSFWAllowed } = state;

  if (!imageData.url) {
    return <div className="text-white">No video URL provided</div>;
  }

  return (
    <div className="relative overflow-hidden">
      {imageData.isNSFW && !isNSFWAllowed && (
        <div className="absolute top-2 right-2 z-30">
          <span className="bg-red-500/80 text-white px-2 py-1 rounded text-sm font-bold">
            NSFW
          </span>
        </div>
      )}
      <video
        src={imageData.url}
        className={`
          w-full h-[400px] min-w-[250px] 
          rounded-lg 
          transition-all ease duration-500 
          relative z-10 
          bg-[#1a282d] 
          object-cover 
          overflow-clip 
          overflow-clip-margin-[content-box]
          ${imageData.isNSFW && !isNSFWAllowed ? 'blur-xl' : ''}
        `}
        controls={!imageData.isNSFW || isNSFWAllowed}
      ></video>
    </div>
  );
}
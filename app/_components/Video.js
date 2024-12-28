import { useAppContext } from "./Context";
import { useEffect, useRef } from "react";
import Hls from "hls.js";

const HLSPlayer = ({ url, title, controls }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const hls = new Hls();
    if (videoRef.current) {
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
    }
    return () => hls.destroy();
  }, [url]);

  return (
    <video
      ref={videoRef}
      className="w-full h-[400px] min-w-[250px] transition-all ease duration-500 rounded-lg bg-[#1a282d] object-cover relative z-20 hover:z-40"
      controls={controls}
      preload="metadata"
      alt={title}
      onLoadedMetadata={(e) => (e.currentTarget.volume = 0.25)}
    />
  );
};

export default function Video({ imageData }) {
  const { state } = useAppContext();
  const { isNSFWAllowed } = state;

  if (!imageData.url) {
    return <div className="text-white">No video URL provided</div>;
  }

  return (
    <div className="relative overflow-hidden  ">
      {imageData.isNSFW && !isNSFWAllowed && (
        <div className="absolute top-2 right-2 z-30">
          <span className="bg-red-500/80 text-white px-2 py-1 rounded text-sm font-bold">
            NSFW
          </span>
        </div>
      )}
      <div
        className={`transition-all ease duration-500 ${
          imageData.isNSFW && !isNSFWAllowed
            ? "blur-xl relative z-20 hover:z-40"
            : ""
        }`}
      >
        {imageData.url?.includes(".m3u8") ? (
          <HLSPlayer
            url={imageData.url}
            title={imageData.title}
            controls={!imageData.isNSFW || isNSFWAllowed}
          />
        ) : (
          <video
            src={imageData.url}
            className="w-full h-[400px] min-w-[250px] transition-all ease duration-500  rounded-lg relative z-20 hover:z-40"
            controls={!imageData.isNSFW || isNSFWAllowed}
            onLoadedMetadata={(e) => (e.currentTarget.volume = 0.25)}
          />
        )}
      </div>
    </div>
  );
}

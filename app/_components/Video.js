import { useAppContext } from "./Context";
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

const HLSPlayer = ({ url, title, controls }) => {
  const videoRef = useRef(null);
  const [blobUrl, setBlobUrl] = useState(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const handleNonHLSVideo = async () => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setBlobUrl(blobUrl);
        videoRef.current.src = blobUrl;
      } catch (error) {
        console.error("Error creating blob URL:", error);
      }
    };

    if (url.includes(".m3u8")) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
      return () => hls.destroy();
    } else {
      handleNonHLSVideo();
    }

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl, url]);

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
    <div className="relative overflow-hidden">
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
        <HLSPlayer
          url={imageData.url}
          title={imageData.title}
          controls={!imageData.isNSFW || isNSFWAllowed}
        />
      </div>
    </div>
  );
}

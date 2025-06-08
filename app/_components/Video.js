import { useAppContext } from "./Context";
import { useEffect, useRef, useState, memo } from "react";
import Hls from "hls.js";

const HLSPlayer = memo(({ url, title, controls, imageData, isNSFWAllowed }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!videoRef.current) return;
    let isMounted = true;

    const cleanup = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };

    const handleNonHLSVideo = async () => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        if (!isMounted) return;
        const newBlobUrl = URL.createObjectURL(blob);
        setBlobUrl(newBlobUrl);
        videoRef.current.src = newBlobUrl;
      } catch (err) {
        if (!isMounted) return;
        setError(err.message);
        console.error("Error creating blob URL:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    cleanup();
    setIsLoading(true);
    setError(null);

    if (url.includes(".m3u8")) {
      if (Hls.isSupported()) {
        hlsRef.current = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hlsRef.current.loadSource(url);
        hlsRef.current.attachMedia(videoRef.current);

        hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
          if (isMounted) setIsLoading(false);
        });

        hlsRef.current.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal && isMounted) {
            setError("Failed to load video");
            setIsLoading(false);
          }
        });
      } else {
        setError("HLS not supported");
        setIsLoading(false);
      }
    } else {
      handleNonHLSVideo();
    }

    return () => {
      isMounted = false;
      cleanup();
    };
  }, [url]);

  if (error) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center text-white bg-[#1a282d] rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="w-full h-[400px] bg-[#1a282d] animate-pulse rounded-lg" />
      )}
      <video
        ref={videoRef}
        className={`w-full h-[400px] min-w-[250px] transition-all ease duration-500 rounded-lg bg-[#000000] object-cover relative z-20 hover:z-40 
        ${isLoading ? "hidden" : "block"} 
        ${imageData.isNSFW && !isNSFWAllowed ? "blur-xl" : ""}`}
        controls={controls}
        preload="metadata"
        alt={title}
        playsInline
        onLoadedMetadata={(e) => {
          e.currentTarget.volume = 0.25;
          setIsLoading(false);
        }}
        onError={() => {
          setError("Video failed to load");
          setIsLoading(false);
        }}
      />
    </>
  );
});

HLSPlayer.displayName = "HLSPlayer";

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
      <div className="relative h-[400px] rounded-lg transition ease duration-500 z-10 bg-[#000000] object-cover overflow-clip flex justify-center items-center">
        <HLSPlayer
          url={imageData.url}
          title={imageData.title}
          controls={!imageData.isNSFW || isNSFWAllowed}
          imageData={imageData}
          isNSFWAllowed={isNSFWAllowed}
        />
      </div>
    </div>
  );
}

import { useAppContext } from "./AppContext";
import { useEffect, useRef, useState, memo, forwardRef } from "react";
import Hls from "hls.js";

const HLSPlayer = memo(
  forwardRef(({ url, title, controls, imageData, isNSFWAllowed }, ref) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const hlsRef = useRef(null);
    const [blobUrl, setBlobUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Combine refs
    const setVideoRef = (element) => {
      videoRef.current = element;
      if (ref) {
        if (typeof ref === "function") {
          ref(element);
        } else {
          ref.current = element;
        }
      }
    };

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
    }, [url]); // BlobURL cleanup is not here because it is causing flickering

    if (error) {
      return (
        <div className="w-full h-full flex items-center justify-center text-white bg-[#1a282d] rounded-lg">
          {error}
        </div>
      );
    }

    return (
      <div ref={containerRef} className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 w-full h-full bg-[#1a282d] animate-pulse rounded-lg" />
      )}

      <video
        ref={setVideoRef}
        className={`w-full h-full rounded-lg bg-[#000000] object-contain
        ${isLoading || error ? "invisible" : "visible"}
        ${imageData.isNSFW && !isNSFWAllowed ? "blur-xl" : ""}`}
        controls={controls}
        preload="metadata"
        aria-label={title}
        playsInline
        onLoadedMetadata={(e) => {
        e.currentTarget.volume = 0.25;
        setIsLoading(false);
        }}
        onError={() => {
        setError("Video not supported in vercel");
        setIsLoading(false);
        }}
      />

      {error && (
        <div
        className="absolute inset-0 flex items-center justify-center text-white bg-[#1a282d] rounded-lg px-4 text-center"
        role="alert"
        aria-live="assertive"
        >
        {error}
        </div>
      )}
      </div>
    );
  })
);

HLSPlayer.displayName = "HLSPlayer";

const Video = forwardRef(({ imageData }, ref) => {
  const { state } = useAppContext();
  const { isNSFWAllowed } = state;
  const videoRef = useRef(null);

  // Combine refs
  const setRefs = (element) => {
    videoRef.current = element;
    if (ref) {
      if (typeof ref === "function") {
        ref(element);
      } else {
        ref.current = element;
      }
    }
  };

  if (!imageData.url) {
    return <div className="text-white">No video URL provided</div>;
  }

  return (
    <div className="relative overflow-hidden h-full w-full">
      {imageData.isNSFW && !isNSFWAllowed && (
        <div className="absolute top-2 right-2 z-30">
          <span className="bg-red-500/80 text-white px-2 py-1 rounded text-sm font-bold">
            NSFW
          </span>
        </div>
      )}
      <div className="relative h-full w-full rounded-lg transition ease duration-500 z-10 bg-[#000000] object-cover overflow-clip flex justify-center items-center">
        <HLSPlayer
          url={imageData.url}
          title={imageData.title}
          controls={!imageData.isNSFW || isNSFWAllowed}
          imageData={imageData}
          isNSFWAllowed={isNSFWAllowed}
          ref={setRefs}
        />
      </div>
    </div>
  );
});

Video.displayName = "Video";

export default Video;

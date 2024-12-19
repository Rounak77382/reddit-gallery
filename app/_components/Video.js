// export default function Video({ image }) {
//   if (!image.url) {
//     return <div className="text-white">No video URL provided</div>;
//   }

//   return (
//     <video controls style={{ width: "100%", height: "100%" , zIndex: "10"}}>
//       <source src={image.url} type="video/mp4" />
//     </video>
//   );
// }
"use client";
import { useState } from 'react';

export default function Video({ image }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  if (!image.url) {
    return <div className="text-white">No video URL provided</div>;
  }

  return (
    <>
      {isLoading && <div className="text-white">Loading video...</div>}
      <video 
        controls 
        style={{ width: "100%", height: "100%", zIndex: "10"}}
        onLoadedData={() => setIsLoading(false)}
        onError={(e) => {
          console.error("Video loading error:", e);
          setError("Video failed to load");
          setIsLoading(false);
        }}
        crossOrigin="anonymous"
      >
        <source 
          src={image.url} 
          type="video/mp4"
        />
        {error && <div className="text-white">{error}</div>}
      </video>
    </>
  );
}
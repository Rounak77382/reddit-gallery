// // [app/_components/Download.js](app/_components/Download.js)
// "use client";
// import { useAppContext } from "./Context";
// import { useEffect, useState } from "react";
// import Card from "./Card";

// export default function Download({ formData }) {
//   const [images, setImages] = useState([]);
//   const { state, dispatch } = useAppContext();

//   useEffect(() => {
//     async function fetchImages() {
//       if (formData) {
//         setImages([]);
//         try {
//           const { searchTerm, postTime, postType, postLimit } = formData;
//           const response = await fetch(
//             `/api/downloader?subredditName=${searchTerm}&limit=${postLimit}&postType=${postType}&since=${postTime}`
//           );

//           console.log("Response:", response);

//           const reader = response.body.getReader();
//           const decoder = new TextDecoder();

//           while (true) {
//             try {
//               const { value, done: doneReading } = await reader.read();
//               if (doneReading) {
//                 console.log("Stream reading done");
//                 break;
//               }
//               const chunk = decoder.decode(value, { stream: true });
//               const image = JSON.parse(chunk);
//               console.log("--Image DATA--", image);
//               setImages((prevImages) => [...prevImages, image]);
//             } catch (err) {
//               console.log("Error reading stream:", err);
//               console.log("Invalid value:", value);
//             }
//           }
//         } catch (error) {
//           console.warn("Error fetching images:", error);
//         }
//       }
//     }

//     fetchImages();
//   }, [formData]);

//   return (
//     <div
//       style={{
//         display: "flex",
//         flexWrap: "wrap",
//         width: "100%",
//         padding: "1px",
//         zoom: state.scaleValue,
//       }}
//     >
//       {images.map((image, index) => (
//         <div
//           key={index}
//           style={{
//             position: "relative",
//             width: "auto",
//           }}
//         >
//           <Card imageData={image} />
//         </div>
//       ))}
//     </div>
//   );
// }

"use client";
import { useAppContext } from "./Context";
import { useEffect, useState, useRef } from "react";
import Card from "./Card";
import { ShimmerThumbnail } from "react-shimmer-effects";

export default function Download({ formData }) {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [shimmerCount, setShimmerCount] = useState(0);
  const { state, dispatch } = useAppContext();
  const allImagesLoaded = useRef(false);
  // Track how many placeholders we need while loading
  const [remainingPlaceholders, setRemainingPlaceholders] = useState(0);

  useEffect(() => {
    if (formData?.postLimit) {
      console.log("Updating shimmer count to:", formData.postLimit);
      const limit = Number(formData.postLimit);
      setShimmerCount(limit);
      setRemainingPlaceholders(limit);
    }
  }, [formData]);

  useEffect(() => {
    async function fetchImages() {
      if (formData) {
        setImages([]);
        setIsLoading(true);
        allImagesLoaded.current = false;
        
        const { searchTerm, postTime, postType, postLimit } = formData;
        setRemainingPlaceholders(Number(postLimit));

        try {
          const response = await fetch(
            `/api/downloader?subredditName=${searchTerm}&limit=${postLimit}&postType=${postType}&since=${postTime}${
              state.isLoggedIn && state.accessToken
                ? `&r=${state.accessToken}`
                : ""
            }`
          );

          if (!response.body) {
            throw new Error("ReadableStream not supported in this browser.");
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          
          while (true) {
            try {
              const { value, done: doneReading } = await reader.read();
              
              if (doneReading) {
                console.log("Stream reading done");
                break;
              }
              
              const chunk = decoder.decode(value, { stream: true });
              
              // Try to extract complete JSON objects from the chunk
              const jsonObjects = extractJsonObjects(chunk);
              
              jsonObjects.forEach(jsonObj => {
                try {
                  const image = JSON.parse(jsonObj);
                  setImages(prevImages => [...prevImages, image]);
                  // Reduce remaining placeholders as we add real content
                  setRemainingPlaceholders(prev => Math.max(0, prev - 1));
                } catch (e) {
                  console.warn("Failed to parse JSON:", jsonObj);
                }
              });
            } catch (err) {
              console.log("Error reading stream:", err);
            }
          }
        } catch (error) {
          console.warn("Error fetching images:", error);
        } finally {
          setIsLoading(false);
          setRemainingPlaceholders(0);
          
          // Dispatch event when all images are loaded
          setTimeout(() => {
            allImagesLoaded.current = true;
            const event = new CustomEvent("allImagesLoaded", {
              detail: { count: images.length },
            });
            window.dispatchEvent(event);
          }, 500);
        }
      }
    }
    
    fetchImages();
  }, [formData, state.accessToken, state.isLoggedIn]);

  // Helper function to extract complete JSON objects from a string
  function extractJsonObjects(str) {
    const results = [];
    let depth = 0;
    let startIndex = -1;
    
    for (let i = 0; i < str.length; i++) {
      if (str[i] === '{') {
        if (depth === 0) startIndex = i;
        depth++;
      } else if (str[i] === '}') {
        depth--;
        if (depth === 0 && startIndex !== -1) {
          results.push(str.substring(startIndex, i + 1));
          startIndex = -1;
        }
      }
    }
    
    return results;
  }

  const ShimmerCard = () => (
    <div className="relative w-[400px] h-[400px] m-5 opacity-5 shadow-lg shadow-black/50">
      <ShimmerThumbnail height={400} rounded />
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        width: "100%",
        padding: "1px",
        zoom: state.scaleValue,
      }}
    >
      {/* Real images that have already loaded */}
      {images.map((image, index) => (
        <div
          key={`image-${index}`}
          style={{ position: "relative", width: "auto" }}
        >
          <Card imageData={image} />
        </div>
      ))}
      
      {/* Placeholder shimmer cards for remaining items */}
      {remainingPlaceholders > 0 && 
        Array(remainingPlaceholders)
          .fill(0)
          .map((_, index) => (
            <ShimmerCard key={`shimmer-${index}`} />
          ))
      }
    </div>
  );
}
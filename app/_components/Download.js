// // [app/_components/Download.js](app/_components/Download.js)
// "use client";
// import { useScale } from "./ScaleContext";
// import { useEffect, useState } from "react";
// import Card from "./Card";

// export default function Download({ formData }) {
//   const [images, setImages] = useState([]);
//   const { scaleValue } = useScale();

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
//         zoom: scaleValue,
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
import { useEffect, useState } from "react";
import Card from "./Card";
import { ShimmerThumbnail } from "react-shimmer-effects";

export default function Download({ formData }) {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [shimmerCount, setShimmerCount] = useState(0);
  const { state } = useAppContext();

  useEffect(() => {
    if (formData?.postLimit) {
      console.log("Updating shimmer count to:", formData.postLimit);
      setShimmerCount(Number(formData.postLimit));
    }
  }, [formData]);

  useEffect(() => {
    async function fetchImages() {
      if (formData) {
        setImages([]);
        setIsLoading(true);
        try {
          const { searchTerm, postTime, postType, postLimit } = formData;

          let response;

          response = await fetch(
            `/api/downloader?subredditName=${searchTerm}&limit=${postLimit}&postType=${postType}&since=${postTime}${
              state.isLoggedIn ? `&r=${state.accessToken}` : ""
            }`
          );

          if (!response.body) {
            throw new Error("ReadableStream not supported in this browser.");
          }

          const reader = response.body
            .pipeThrough(new TextDecoderStream())
            .pipeThrough(parseNDJSON())
            .getReader();

          while (true) {
            const { value: image, done } = await reader.read();
            if (done) break;
            setImages((prevImages) => [...prevImages, image]);
          }
        } catch (error) {
          console.warn("Error fetching images:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchImages();
  }, [formData, state.accessToken, state.isLoggedIn]);

  function parseNDJSON() {
    let ndjsonBuffer = "";

    return new TransformStream({
      transform(chunk, controller) {
        try {
          ndjsonBuffer += chunk;
          const lines = ndjsonBuffer.split("\n");
          ndjsonBuffer = lines.pop() || "";

          for (const line of lines) {
            if (line.trim()) {
              try {
                const parsedLine = JSON.parse(line);
                controller.enqueue(parsedLine);
              } catch (e) {
                // Try to split potentially concatenated JSON objects
                const jsonStrings = line.match(/\{[^}]+\}/g);
                if (jsonStrings) {
                  jsonStrings.forEach((jsonStr) => {
                    try {
                      const parsed = JSON.parse(jsonStr);
                      controller.enqueue(parsed);
                    } catch (err) {
                      console.warn("Failed to parse JSON substring:", jsonStr);
                    }
                  });
                }
              }
            }
          }
        } catch (error) {
          console.warn("Transform error:", error);
        }
      },

      flush(controller) {
        if (ndjsonBuffer.trim()) {
          try {
            // Try to split potentially concatenated JSON objects in final buffer
            const jsonStrings = ndjsonBuffer.match(/\{[^}]+\}/g);
            if (jsonStrings) {
              jsonStrings.forEach((jsonStr) => {
                try {
                  const parsed = JSON.parse(jsonStr);
                  controller.enqueue(parsed);
                } catch (err) {
                  console.warn(
                    "Failed to parse JSON in final buffer:",
                    jsonStr
                  );
                }
              });
            }
          } catch (e) {
            console.warn("Flush error:", e);
          }
        }
      },
    });
  }
  const ShimmerCards = () => (
    <>
      {console.log("No of shimmer cards:", shimmerCount)}
      <div className="flex flex-wrap w-full p-0 m-0">
        {Array(shimmerCount)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              className="relative w-[400px] h-[400px] m-5 opacity-5 shadow-lg shadow-black/50"
            >
              <ShimmerThumbnail height={400} rounded />
            </div>
          ))}
      </div>
    </>
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
      {isLoading ? (
        <ShimmerCards />
      ) : (
        images.map((image, index) => (
          <div
            key={index}
            style={{ position: "relative", width: "auto" }}
            className=""
          >
            <Card imageData={image} />
          </div>
        ))
      )}
    </div>
  );
}

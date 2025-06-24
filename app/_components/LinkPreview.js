"use client";

export default function LinkPreview({ imageData }) {
  try {
    const url = new URL(imageData.url);
    const hostname = url.hostname;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;

    return (
      <div className="w-full h-[400px] rounded-lg min-w-[250px] bg-primary p-6 flex flex-col z-20 hover:z-40 overflow-hidden">
        <div className="flex items-center mb-4">
          {/* Generic web icon */}
          <div
            className="flex-shrink-0 mr-3 aspect-square"
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              backgroundColor: "#2563EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "30px", height: "30px" }}
              className="text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
          </div>
          <div className="truncate">
            <h3 className="text-white text-lg font-medium truncate">
              {hostname}
            </h3>
            <p className="text-gray-400 text-xs truncate">
              {url.pathname.slice(0, 40)}
              {url.pathname.length > 40 ? "..." : ""}
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col max-h-[290px]">
          <h2 className="text-white text-lg font-bold mb-3 line-clamp-2">
            {imageData.title || "Visit this website"}
          </h2>

          {/* Browser mockup for link preview */}
          <div className="bg-gray-800 rounded-lg mb-3 border border-gray-700 flex-1 max-h-[170px] overflow-hidden">
            <div className="bg-gray-900 px-3 py-2 flex items-center border-b border-gray-700">
              <div className="flex space-x-1.5 mr-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              </div>
              <div className="bg-gray-700 rounded px-2 py-1 text-xs text-gray-300 flex-1 truncate">
                {url.toString()}
              </div>
            </div>
            <div className="p-4 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <img
                  src={faviconUrl}
                  alt={`Favicon for ${hostname}`}
                  className="w-12 h-12 mb-2"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = "none";
                  }}
                />
                <div className="text-center">
                  <span className="text-gray-300 text-xs block">
                    {hostname}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <a
              href={imageData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base font-medium w-full justify-center"
            >
              Open Website
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering URL preview:", error);
    return (
      <div className="w-full h-[400px] rounded-lg min-w-[250px] flex items-center justify-center bg-primary text-white">
        <a
          href={imageData.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          {imageData.url}
        </a>
      </div>
    );
  }
}
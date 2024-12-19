export default function Video({ image }) {
  if (!image.url) {
    return <div className="text-white">No video URL provided</div>;
  }

  return (
    <iframe
      src={image.url}
      style={{ width: "100%", height: "100%", zIndex: "10" }}
      allow="autoplay; encrypted-media"
      allowFullScreen
    ></iframe>
  );
}
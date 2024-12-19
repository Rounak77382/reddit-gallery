export default function Video({ image }) {
  if (!image.url) {
    return <div className="text-white">No video URL provided</div>;
  }

  return (
    <video controls style={{ width: "100%", height: "100%", zIndex: "10" }}>
      <source src={image.url} type="video/mp4" />
    </video>
  );
}

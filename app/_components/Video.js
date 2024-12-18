export default function Video({ image }) {
  if (!image.url) {
    return <div>No video URL provided</div>;
  }

  return (
    <video controls style={{ width: "100%", height: "100%" }}>
      <source src={image.url} type="video/mp4" />
    </video>
  );
}

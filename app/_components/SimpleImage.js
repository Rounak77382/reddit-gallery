export default function SimpleImage({ url }) {
  return (
    <img
      src={url}
      alt={url}
      className="w-full h-[400px] min-w-[250px] rounded-lg transition ease duration-500 relative z-10 bg-[#1a282d] object-cover overflow-clip overflow-clip-margin-[content-box]"
      onError={(e) => {
        e.target.onerror = null;
      }}
    />
  );
}

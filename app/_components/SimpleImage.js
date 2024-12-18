export default function SimpleImage({ url }) {
    return (
        <img
        src={url}
        alt={url}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onError={(e) => {
            e.target.onerror = null;
        }}
        />
    );
}

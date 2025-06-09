"use client";

export default function TextContent({ content }) {
  return (
    <div 
      className="w-full h-[400px] rounded-lg min-w-[250px] overflow-y-auto prose prose-invert bg-primary"
      style={{ 
        msOverflowStyle: 'none', 
        scrollbarWidth: 'none' 
      }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div
        className="text-white h-full text-sm relative p-4 bg-primary z-20 hover:z-40 rounded-t-lg"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
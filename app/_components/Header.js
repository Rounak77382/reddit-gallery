import Search from "./Search";

export default function Header() {
  return (
    <div className="flex justify-between items-center flex-wrap border-b border-[#1a282d] h-auto mt-2 relative z-1">
      <h1 className="text-white px-5 w-fit my-2 text-4xl">Reddit Gallery</h1>
      <div className="flex items-center justify-center w-[8/10]">
        <Search />
      </div>
    </div>
  );
}

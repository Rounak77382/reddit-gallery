"use client";
import { useScale } from "./ScaleContext";

export default function Scale() {
  const { scaleValue, setScaleValue } = useScale();

  const handleScaleChange = (e) => {
    setScaleValue(parseFloat(e.target.value).toFixed(3));
  };

  return (
    <div
      id="scaleControl"
      className="flex items-center justify-between p-3 bg-primary rounded-full"
    >
      <label htmlFor="scaleSlider" className="mx-2.5 text-foreground text-[15px]" >
        Scale
      </label>
      <input
        type="range"
        id="scaleSlider"
        min="0.500"
        max="2.000"
        step="0.001"
        value={scaleValue}
        onChange={handleScaleChange}
        className="cursor-pointer w-full h-2.5 rounded-lg bg-gray-300 outline-none opacity-70 transition-opacity duration-200"
        style={{
          WebkitAppearance: "none",
          appearance: "none",
          height: "10px",
          borderRadius: "7.5px",
          background: "#f0f0f0",
          outline: "none",
          opacity: "0.7",
          transition: "opacity .2s",
        }}
      />
      <span className="mx-2.5 text-foreground text-[15px] w-16 text-center">
        {parseFloat(scaleValue).toFixed(3)}
      </span>
      <style jsx>{`
        #scaleSlider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 15px;
          height: 15px;
          background: #ff4500;
          border-radius: 50%;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
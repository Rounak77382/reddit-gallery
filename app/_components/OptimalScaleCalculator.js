"use client";
import { useAppContext } from "./AppContext";
import { motion } from "framer-motion";

export default function Scale() {
  const { state, dispatch } = useAppContext();

  const handleScaleChange = (e) => {
    const currentValue = parseFloat(e.target.value);
    dispatch({
      type: "SET_SCALE",
      payload: parseFloat(currentValue).toFixed(3),
    });
  };

  return (
    <div className="flex items-center relative h-10">
      <div
        id="scaleControl"
        className="flex items-center justify-between p-3 py-2 bg-primary rounded-full h-10"
      >
        <motion.label
          htmlFor="scaleSlider"
          className="mx-2.5 text-foreground text-[15px] w-[40px] font-medium"
        >
          Scale
        </motion.label>
        <div className="relative w-[180px]">
          <motion.div
            className="absolute top-1/2 left-0 right-0 h-[6px] -translate-y-1/2 rounded-full overflow-hidden"
            style={{
              background: "rgba(240, 240, 240, 0.6)",
              boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)",
            }}
          >
            <motion.div
              className="absolute top-0 left-0 h-full"
              style={{
                width: `${((parseFloat(state.scaleValue) - 0.5) / 1) * 100}%`,
                background:
                  "linear-gradient(90deg, rgba(255,69,0,0.7) 0%, rgba(255,87,34,0.9) 100%)",
                borderRadius: "inherit",
              }}
            />
          </motion.div>
          <input
            type="range"
            id="scaleSlider"
            min="0.500"
            max="1.500"
            step="0.001"
            value={state.scaleValue}
            onChange={handleScaleChange}
            className="cursor-pointer w-[180px] rounded-full bg-transparent relative z-10 outline-none opacity-100 transition-opacity duration-200"
            style={{
              WebkitAppearance: "none",
              appearance: "none",
              height: "6px",
              borderRadius: "999px",
              verticalAlign: "middle",
              margin: "0 auto",
            }}
          />
        </div>
        <span className="mx-2.5 text-foreground text-[15px] w-[40px] text-center font-medium text-white">
          {parseFloat(state.scaleValue).toFixed(3)}
        </span>
      </div>

      <style jsx>{`
        #scaleSlider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          background: linear-gradient(135deg, #ff5722, #ff4500);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.1),
            0 1px 3px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          position: relative;
          top: -1px;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        #scaleSlider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 3px rgba(255, 69, 0, 0.15),
            0 2px 5px rgba(0, 0, 0, 0.25);
        }

        #scaleSlider::-webkit-slider-thumb:active {
          transform: scale(0.92);
          box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.2),
            0 1px 2px rgba(0, 0, 0, 0.3);
        }

        #scaleSlider:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * AnimationDemo Component
 *
 * This is a standalone demo component showcasing the animation capabilities
 * implemented in the Reddit Gallery. It can be used for testing and as
 * a reference for how the animations work.
 */
export default function AnimationDemo() {
  const [items, setItems] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
  const [activeItem, setActiveItem] = useState(null);

  // Toggle zoom state for an item
  const toggleZoom = (id) => {
    setActiveItem(activeItem === id ? null : id);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Animation Features Demo</h1>
      <p className="mb-6">
        This demo showcases the Framer Motion animation capabilities used in the
        Reddit Gallery. Click or hover on items to see the zoom and reflow
        effects.
      </p>

      {/* Grid layout with animated items */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <motion.div
            key={item}
            layout
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              scale: activeItem === item ? 1.15 : 1,
              zIndex: activeItem === item ? 10 : 1,
            }}
            whileHover={{
              scale: 1.05,
              zIndex: 5,
              transition: { duration: 0.3 },
            }}
            transition={{
              layout: { type: "spring", stiffness: 300, damping: 30 },
              scale: { duration: 0.3 },
            }}
            onClick={() => toggleZoom(item)}
            className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-lg cursor-pointer h-40 flex items-center justify-center text-white font-bold"
          >
            <div className="text-center">
              <div className="text-2xl">Item {item}</div>
              <div className="text-sm mt-2">
                {activeItem === item ? "Click to shrink" : "Click to zoom"}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Animation Features:</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>CSS Grid Layout:</strong> Responsive grid that adapts to
            different screen sizes
          </li>
          <li>
            <strong>Framer Motion Layout Prop:</strong> Enables smooth reflow of
            surrounding items
          </li>
          <li>
            <strong>Performant Scale Transform:</strong> Uses GPU-accelerated
            transform instead of size changes
          </li>
          <li>
            <strong>Spring Physics:</strong> Natural-feeling animations with
            configurable stiffness and damping
          </li>
          <li>
            <strong>Hover Animations:</strong> Interactive feedback when users
            hover over items
          </li>
        </ul>
      </div>
    </div>
  );
}

// app/_lib/JustifiedLayout.js

export function calculateJustifiedLayout({
  containerWidth,
  targetRowHeight = 400,
  items,
  gap = 8, // space between items (using native flex gap)
}) {
  if (!items || items.length === 0 || !containerWidth) return [];

  const layouts = [];
  let currentRow = [];
  let currentRowWidth = 0; 
  
  const layoutItems = items.map((item, index) => ({
    originalIndex: index,
    aspectRatio: parseFloat(item.aspectRatio || 1.33)
  }));

  for (let i = 0; i < layoutItems.length; i++) {
    const item = layoutItems[i];
    
    currentRow.push(item);
    currentRowWidth += targetRowHeight * item.aspectRatio;

    const currentTotalGaps = Math.max(0, currentRow.length - 1) * gap;
    
    if (currentRowWidth + currentTotalGaps >= containerWidth) {
      let scale = (containerWidth - currentTotalGaps) / currentRowWidth;
      let finalRowHeight = targetRowHeight * scale;
      
      currentRow.forEach(rowItem => {
        const itemWidth = Math.floor(finalRowHeight * rowItem.aspectRatio);
        layouts.push({
          index: rowItem.originalIndex,
          width: itemWidth,
          height: Math.floor(finalRowHeight),
        });
      });
      
      const rowSumWidth = layouts.slice(-currentRow.length).reduce((sum, lay) => sum + lay.width, 0);
      const diff = (containerWidth - currentTotalGaps) - rowSumWidth;
      if (layouts.length > 0) {
        layouts[layouts.length - 1].width += diff;
      }
      
      currentRow = [];
      currentRowWidth = 0;
    }
  }

  if (currentRow.length > 0) {
    let finalRowHeight = targetRowHeight;
    
    currentRow.forEach((rowItem) => {
      const itemWidth = Math.floor(finalRowHeight * rowItem.aspectRatio);
      layouts.push({
        index: rowItem.originalIndex,
        width: itemWidth,
        height: Math.floor(finalRowHeight),
      });
    });
  }

  layouts.sort((a, b) => a.index - b.index);
  return layouts;
}

/**
 * Calculates scale values that minimize empty space between items
 * @param {number[]} a - Array of item widths
 * @param {number} screen_width - The width of the screen
 * @param {number} screen_margin - Margin on each side of the screen
 * @param {number} container_margin - Margin on each side of the container
 * @returns {number[]} - Array of optimal scale values that minimize gaps
 */
export function minimumgap(
  a,
  screen_width,
  screen_margin = 0,
  container_margin = 0
) {
  let optimal_scale = 0;
  let min_gap = Infinity;
  let gaps = [];

  for (let z = 500; z < 2000; z++) {
    let zFloat = z / 1000.0;
    let sw = screen_width / zFloat - 2 * screen_margin;
    let line_sum = 0;
    let gap_sum = 0;

    for (let item of a) {
      let item_width = item + 2 * container_margin;
      if (line_sum + item_width > sw) {
        gap_sum += sw - line_sum;
        line_sum = item_width;
      } else {
        line_sum += item_width;
      }

      if (line_sum === sw) {
        line_sum = 0;
      }
    }

    // if (line_sum !== 0) {
    //   gap_sum += sw - line_sum;
    // }

    gaps.push(Math.floor(gap_sum));

    if (gap_sum < min_gap) {
      min_gap = gap_sum;
      optimal_scale = zFloat;
    }
  }

  let minimas = [];
  for (let i = 1; i < gaps.length - 1; i++) {
    if (gaps[i] < gaps[i - 1] && gaps[i] < gaps[i + 1]) {
      minimas.push(i + 500);
    }
  }

  return minimas.map((minima) => minima / 1000);
}

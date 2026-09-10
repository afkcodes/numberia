/** Pixel geometry shared by every fruit tray. A berry always fits its own tray. */
export function fruitGrid(
  boardWidth: number,
  leftRatio: number,
  widthRatio: number,
  count: number,
  tokenSize = 40,
) {
  const left = boardWidth * leftRatio,
    width = boardWidth * widthRatio;
  const padding = 8;
  const columns = Math.max(1, Math.floor((width - padding * 2) / (tokenSize + 4)));
  const cell = (width - padding * 2) / columns;
  const rows = Math.ceil(count / columns);
  return {
    left,
    width,
    rows,
    height: 60 + rows * (tokenSize + 8),
    at: (index: number) => ({
      x: left + padding + (index % columns) * cell + (cell - tokenSize) / 2,
      y: 49 + Math.floor(index / columns) * (tokenSize + 8),
    }),
  };
}

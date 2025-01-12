const drawMassLabel = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
): void => {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, 2 * Math.PI);
  ctx.stroke();
};

const drawBarycenterLabel = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
): void => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();

  ctx.moveTo(x, y - 30);
  ctx.lineTo(x, y + 30);
  ctx.stroke();

  ctx.moveTo(x, y);
  ctx.lineTo(x + 30, y);
  ctx.stroke();
};

export { drawMassLabel, drawBarycenterLabel };

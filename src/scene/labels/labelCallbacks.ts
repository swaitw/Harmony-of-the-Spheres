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

const drawLagrangeLabel = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
): void => {
  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 2;
  ctx.beginPath();

  ctx.moveTo(x - 8, y);
  ctx.lineTo(x + 8, y);
  ctx.stroke();

  ctx.moveTo(x, y - 8);
  ctx.lineTo(x, y + 8);
  ctx.stroke();
};

export { drawMassLabel, drawBarycenterLabel, drawLagrangeLabel };

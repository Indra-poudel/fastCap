export const getTransformedBoundingBox = (
  x: number,
  y: number,
  width: number,
  height: number,
  scale: number,
  rotation: number,
) => {
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  const corners = [
    {x: x, y: y}, // Top-Left
    {x: x + width, y: y}, // Top-Right
    {x: x + width, y: y + height}, // Bottom-Right
    {x: x, y: y + height}, // Bottom-Left
  ];

  const transformPoint = (point: {x: number; y: number}) => {
    const translatedX = point.x - centerX;
    const translatedY = point.y - centerY;

    const scaledX = translatedX * scale;
    const scaledY = translatedY * scale;

    const rotatedX =
      scaledX * Math.cos(rotation) - scaledY * Math.sin(rotation);
    const rotatedY =
      scaledX * Math.sin(rotation) + scaledY * Math.cos(rotation);

    const finalX = rotatedX + centerX;
    const finalY = rotatedY + centerY;

    return {x: finalX, y: finalY};
  };

  const transformedCorners = corners.map(transformPoint);

  const xs = transformedCorners.map(point => point.x);
  const ys = transformedCorners.map(point => point.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const newWidth = maxX - minX;
  const newHeight = maxY - minY;

  return {
    newX: minX,
    newY: minY,
    newWidth: newWidth,
    newHeight: newHeight,
  };
};

const HUE_GOLDEN_ANGLE = 137.508;

const computeStableStringHash = (text: string): number => {
  let hashAccumulator = 2166136261;

  for (
    let characterIndex = 0;
    characterIndex < text.length;
    characterIndex++
  ) {
    hashAccumulator ^= text.charCodeAt(characterIndex);
    hashAccumulator = Math.imul(hashAccumulator, 16777619);
  }

  return hashAccumulator >>> 0;
};

const getMassOrbitTrailColor = (
  massName: string,
  massIndex = 0,
): string => {
  const hash = computeStableStringHash(massName);

  const hue = (massIndex * HUE_GOLDEN_ANGLE + (hash % 360) * 0.25) % 360;
  const saturation = 72 + (hash % 17);
  const lightness = 58 + ((hash >>> 8) % 14);

  return `hsl(${hue.toFixed(1)}, ${saturation}%, ${lightness}%)`;
};

export { getMassOrbitTrailColor };
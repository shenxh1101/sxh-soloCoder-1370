export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 255, g: 255, b: 255 };
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return (
    '#' +
    [r, g, b]
      .map(x => {
        const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
};

export const mixColors = (
  colors: { color: string; weight: number }[]
): string => {
  if (colors.length === 0) return '#ffffff';
  if (colors.length === 1) return colors[0].color;

  const totalWeight = colors.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight === 0) return '#ffffff';

  let r = 0,
    g = 0,
    b = 0;

  for (const { color, weight } of colors) {
    const rgb = hexToRgb(color);
    const normalizedWeight = weight / totalWeight;
    r += rgb.r * normalizedWeight;
    g += rgb.g * normalizedWeight;
    b += rgb.b * normalizedWeight;
  }

  return rgbToHex(r, g, b);
};

export const getColorDifference = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const rDiff = rgb1.r - rgb2.r;
  const gDiff = rgb1.g - rgb2.g;
  const bDiff = rgb1.b - rgb2.b;
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
};

export const applyIndicatorColor = (
  baseColor: string,
  ph: number,
  indicatorId: string,
  indicatorAmount: number
): string => {
  if (indicatorAmount <= 0) return baseColor;

  let indicatorColor = baseColor;
  const blendRatio = Math.min(1, indicatorAmount * 2);

  switch (indicatorId) {
    case 'phenolphthalein':
      if (ph > 8.2) {
        const intensity = Math.min(1, (ph - 8.2) / 3);
        indicatorColor = rgbToHex(
          255 * intensity + (1 - intensity) * 255,
          64 * intensity + (1 - intensity) * 255,
          129 * intensity + (1 - intensity) * 255
        );
      }
      break;
    case 'litmus':
      if (ph < 5) {
        const intensity = Math.min(1, (5 - ph) / 3);
        indicatorColor = rgbToHex(
          244 + (1 - intensity) * 11,
          67 * intensity + (1 - intensity) * 54,
          54 * intensity + (1 - intensity) * 176
        );
      } else if (ph > 8) {
        const intensity = Math.min(1, (ph - 8) / 3);
        indicatorColor = rgbToHex(
          33 * intensity + (1 - intensity) * 156,
          150 * intensity + (1 - intensity) * 39,
          243 * intensity + (1 - intensity) * 176
        );
      }
      break;
    case 'methyl-orange':
      if (ph < 3.1) {
        indicatorColor = '#f44336';
      } else if (ph > 4.4) {
        indicatorColor = '#ffc107';
      } else {
        const t = (ph - 3.1) / 1.3;
        indicatorColor = rgbToHex(
          244 * (1 - t) + 255 * t,
          67 * (1 - t) + 193 * t,
          54 * (1 - t) + 7 * t
        );
      }
      break;
  }

  const baseRgb = hexToRgb(baseColor);
  const indicatorRgb = hexToRgb(indicatorColor);

  return rgbToHex(
    baseRgb.r * (1 - blendRatio * 0.8) + indicatorRgb.r * blendRatio * 0.8,
    baseRgb.g * (1 - blendRatio * 0.8) + indicatorRgb.g * blendRatio * 0.8,
    baseRgb.b * (1 - blendRatio * 0.8) + indicatorRgb.b * blendRatio * 0.8
  );
};

export const getPhColor = (ph: number): string => {
  if (ph < 2) return '#d32f2f';
  if (ph < 4) return '#f57c00';
  if (ph < 6) return '#fbc02d';
  if (ph < 8) return '#689f38';
  if (ph < 10) return '#1976d2';
  if (ph < 12) return '#7b1fa2';
  return '#4a148c';
};

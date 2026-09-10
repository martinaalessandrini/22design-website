const TWO_PI = Math.PI * 2;

export function wrapAngle(angle: number) {
  return ((angle % TWO_PI) + TWO_PI) % TWO_PI;
}

export function equalAngles(count: number, offset = 0) {
  if (count <= 0) return [];
  return Array.from({ length: count }, (_, i) => offset + (i / count) * TWO_PI);
}

export function advanceOrbit(angles: number[], delta: number) {
  return angles.map((angle) => angle + delta);
}

export function angularGaps(angles: number[]) {
  if (angles.length < 2) return [];
  const sorted = angles.map(wrapAngle).sort((a, b) => a - b);
  return sorted.map((angle, i) => {
    const next = i === sorted.length - 1 ? sorted[0] + TWO_PI : sorted[i + 1];
    return next - angle;
  });
}

export function gapSpread(angles: number[]) {
  const gaps = angularGaps(angles);
  if (gaps.length === 0) return 0;
  return Math.max(...gaps) - Math.min(...gaps);
}

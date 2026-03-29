/**
 * 1 очко за тап; каждый 11-й тап даёт 10 очков (вместо 1).
 * Эквивалентно: points = taps + 9 * floor(taps / 11)
 */
export function pointsFromTaps(taps: number): number {
  if (taps <= 0) {
    return 0;
  }
  return taps + 9 * Math.floor(taps / 11);
}

export function pointsDeltaForNextTap(currentTaps: number): number {
  const next = currentTaps + 1;
  return pointsFromTaps(next) - pointsFromTaps(currentTaps);
}

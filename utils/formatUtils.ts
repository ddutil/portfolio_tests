/**
 * Formats a duration in milliseconds into a human-readable string.
 * < 1s   → "Xms"
 * < 1min → "X.Xs"
 * >= 1min → "Xm Xs"
 */
export function fmtDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
}

export function runtimeBucketToRange(bucket: string): { min: number; max?: number } | null {
  const trimmed = bucket.trim();
  if (!trimmed) return null;

  if (trimmed.endsWith("+")) {
    const min = Number(trimmed.slice(0, -1));
    if (Number.isNaN(min)) return null;
    return { min };
  }

  const parts = trimmed.split("-").map((part) => Number(part.trim()));
  if (parts.length !== 2 || parts.some((value) => Number.isNaN(value))) return null;

  const [min, max] = parts;
  if (max < min) return null;
  return { min, max };
}

export interface RuntimeBucketDef {
  key: string;
  min: number;
  max?: number;
}

export const RUNTIME_BUCKETS: RuntimeBucketDef[] = [
  { key: "0-15", min: 0, max: 15 },
  { key: "16-30", min: 16, max: 30 },
  { key: "31-45", min: 31, max: 45 },
  { key: "46-60", min: 46, max: 60 },
  { key: "61-90", min: 61, max: 90 },
  { key: "91-120", min: 91, max: 120 },
  { key: "121-150", min: 121, max: 150 },
  { key: "151-180", min: 151, max: 180 },
  { key: "181-240", min: 181, max: 240 },
  { key: "241-300", min: 241, max: 300 },
  { key: "301+", min: 301 },
];

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

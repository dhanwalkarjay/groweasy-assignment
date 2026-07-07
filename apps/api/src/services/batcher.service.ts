export function chunkArray<T>(items: T[], batchSize: number): T[][] {
  if (batchSize <= 0) {
    throw new Error("batchSize must be greater than 0");
  }

  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += batchSize) {
    chunks.push(items.slice(index, index + batchSize));
  }
  return chunks;
}

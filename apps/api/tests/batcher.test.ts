import { describe, expect, it } from "vitest";
import { chunkArray } from "../src/services/batcher.service.js";

describe("chunkArray", () => {
  it("splits rows into fixed-size batches without dropping items", () => {
    const chunks = chunkArray([1, 2, 3, 4, 5], 2);
    expect(chunks).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunks.flat()).toEqual([1, 2, 3, 4, 5]);
  });

  it("rejects invalid batch sizes", () => {
    expect(() => chunkArray([1], 0)).toThrow("batchSize must be greater than 0");
  });
});

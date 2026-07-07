// import type { Request, Response } from "express";
// import pLimit from "p-limit";
// import type { ImportResponse } from "@groweasy/shared";
// import { env } from "../config/env.js";
// import { chunkArray } from "../services/batcher.service.js";
// import { parseCsvBuffer } from "../services/csvParser.service.js";
// import { mapBatchWithGemini } from "../services/gemini.service.js";

// export async function importCsv(req: Request, res: Response) {
//   if (!req.file) {
//     res.status(400).json({ success: false, error: "Invalid file" });
//     return;
//   }

//   const rows = parseCsvBuffer(req.file.buffer);
//   const batches = chunkArray(rows, env.batchSize);
//   const limit = pLimit(env.maxConcurrentBatches);
//   const results = await Promise.all(batches.map((batch) => limit(() => mapBatchWithGemini(batch))));

//   const records = results.flatMap((result) => result.records);
//   const skipped = results.flatMap((result) => result.skipped);

//   const response: ImportResponse = {
//     success: true,
//     totalRows: rows.length,
//     totalImported: records.length,
//     totalSkipped: skipped.length,
//     records,
//     skipped
//   };

//   res.json(response);
// }





import type { Request, Response } from "express";
import pLimit from "p-limit";
import type { ImportResponse } from "@groweasy/shared";
import { env } from "../config/env.js";
import { chunkArray } from "../services/batcher.service.js";
import { parseCsvBuffer } from "../services/csvParser.service.js";
import { mapBatchWithGroq } from "../services/gemini.service.js";
import { logger } from "../utils/logger.js";

export async function importCsv(req: Request, res: Response) {
  if (!req.file) {
    res.status(400).json({ success: false, error: "Invalid file" });
    return;
  }

  try {
    const rows = parseCsvBuffer(req.file.buffer);
    const batches = chunkArray(rows, env.batchSize);
    const limit = pLimit(env.maxConcurrentBatches);

    logger.info(`Processing ${rows.length} rows in ${batches.length} batches`);

    const results = await Promise.all(
      batches.map((batch) => limit(() => mapBatchWithGroq(batch)))
    );

    const records = results.flatMap((result) => result.records);
    const skipped = results.flatMap((result) => result.skipped);

    const response: ImportResponse = {
      success: true,
      totalRows: rows.length,
      totalImported: records.length,
      totalSkipped: skipped.length,
      records,
      skipped
    };

    logger.info(`Import complete: ${records.length} imported, ${skipped.length} skipped`);
    res.json(response);
  } catch (error) {
    logger.error("Import failed", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Import failed unexpectedly"
    });
  }
}
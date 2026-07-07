import { parse } from "csv-parse/sync";
import type { RawCsvRow } from "@groweasy/shared";

export function parseCsvBuffer(buffer: Buffer): RawCsvRow[] {
  return parse(buffer, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as RawCsvRow[];
}

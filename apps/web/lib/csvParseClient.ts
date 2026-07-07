import Papa from "papaparse";
import type { RawCsvRow } from "./types";

export async function parseCsvClient(file: File): Promise<RawCsvRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawCsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      transform: (value) => value.trim(),
      complete: (result) => {
        if (result.errors.length) {
          reject(new Error(result.errors[0]?.message ?? "Could not parse CSV"));
          return;
        }
        resolve(result.data);
      },
      error: (error) => reject(error)
    });
  });
}

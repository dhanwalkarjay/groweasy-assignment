"use client";

import { useMemo, useState } from "react";
import { importCsv } from "@/lib/api";
import { parseCsvClient } from "@/lib/csvParseClient";
import type { ImportResponse, RawCsvRow } from "@/lib/types";

type ImportState = "idle" | "previewed" | "importing" | "done" | "error";

export function useImportFlow() {
  const [state, setState] = useState<ImportState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<RawCsvRow[]>([]);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState("");

  const columns = useMemo(() => {
    const keys = new Set<string>();
    rows.slice(0, 100).forEach((row) => Object.keys(row).forEach((key) => keys.add(key)));
    return [...keys];
  }, [rows]);

  async function loadFile(nextFile: File) {
    setError("");
    setResult(null);

    if (!nextFile.name.toLowerCase().endsWith(".csv")) {
      setState("error");
      setError("Upload a .csv file.");
      return;
    }
    if (nextFile.size > 5 * 1024 * 1024) {
      setState("error");
      setError("CSV file must be 5MB or smaller.");
      return;
    }

    try {
      const parsedRows = await parseCsvClient(nextFile);
      setFile(nextFile);
      setRows(parsedRows);
      setState("previewed");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Could not parse CSV.");
    }
  }

  async function confirmImport() {
    if (!file) return;
    console.log(">>> [Frontend] confirmImport initiated.");
    
    // Defer setting state to 'importing' to allow the browser's fetch call
    // to be registered on the network socket before the button is disabled.
    setTimeout(() => {
      setState("importing");
    }, 0);
    
    setError("");

    try {
      console.log(">>> [Frontend] Sending request via importCsv()...");
      const data = await importCsv(file);
      console.log(">>> [Frontend] importCsv() succeeded. Data:", data);
      setResult(data);
      setState("done");
    } catch (err) {
      console.error(">>> [Frontend] importCsv() threw an error:", err);
      setState("error");
      setError(err instanceof Error ? err.message : "Import failed.");
    }
  }

  function reset() {
    setState("idle");
    setFile(null);
    setRows([]);
    setResult(null);
    setError("");
  }

  return {
    state,
    file,
    rows,
    columns,
    result,
    error,
    loadFile,
    confirmImport,
    reset
  };
}

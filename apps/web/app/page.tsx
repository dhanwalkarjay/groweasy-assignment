"use client";

import { Check, RotateCcw } from "lucide-react";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { PreviewTable } from "@/components/PreviewTable";
import { ProgressBar } from "@/components/ProgressBar";
import { ResultTable } from "@/components/ResultTable";
import { StatsCards } from "@/components/StatsCards";
import { UploadDropzone } from "@/components/UploadDropzone";
import { useImportFlow } from "@/hooks/useImportFlow";

export default function Home() {
  const flow = useImportFlow();
  const canImport = flow.state === "previewed" && flow.rows.length > 0;

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-leaf dark:text-citrus">GrowEasy AI Importer</p>
            <h1 className="mt-1 text-3xl font-semibold">Map any lead CSV into CRM-ready records</h1>
          </div>
          <DarkModeToggle />
        </header>

        <UploadDropzone fileName={flow.file?.name} onFile={flow.loadFile} onReset={flow.reset} />

        {flow.error ? (
          <div className="rounded-md border border-clay bg-white p-4 text-sm font-medium text-clay shadow-sm dark:bg-zinc-900">
            {flow.error}
          </div>
        ) : null}

        {flow.state === "importing" ? <ProgressBar label="AI is mapping fields and validating contact data" /> : null}

        {flow.rows.length ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Confirm only after the preview looks like the intended upload.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={flow.reset}
                className="focus-ring inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <RotateCcw size={16} />
                Reset
              </button>
              <button
                type="button"
                disabled={!canImport}
                onClick={flow.confirmImport}
                className="focus-ring inline-flex items-center gap-2 rounded-md bg-leaf px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-citrus dark:text-ink dark:hover:bg-lime-200"
              >
                <Check size={16} />
                Confirm Import
              </button>
            </div>
          </div>
        ) : null}

        <PreviewTable rows={flow.rows} columns={flow.columns} />

        {flow.result ? (
          <>
            <StatsCards result={flow.result} />
            <ResultTable records={flow.result.records} skipped={flow.result.skipped} />
          </>
        ) : null}
      </div>
    </main>
  );
}

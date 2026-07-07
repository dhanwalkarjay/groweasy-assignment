"use client";

import type { CrmRecord, SkippedRecord } from "@/lib/types";

const columns: (keyof CrmRecord)[] = [
  "created_at",
  "name",
  "email",
  "country_code",
  "mobile_without_country_code",
  "company",
  "city",
  "state",
  "country",
  "lead_owner",
  "crm_status",
  "crm_note",
  "data_source",
  "possession_time",
  "description"
];

export function ResultTable({ records, skipped }: { records: CrmRecord[]; skipped: SkippedRecord[] }) {
  return (
    <section className="space-y-4">
      <div className="rounded-md border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-semibold">Mapped CRM records</h2>
        </div>
        <div className="max-h-[520px] overflow-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="sticky top-0 z-10 bg-zinc-100 dark:bg-zinc-800">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="whitespace-nowrap border-b border-zinc-200 px-3 py-2 font-semibold dark:border-zinc-700">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={`${record.email}-${record.mobile_without_country_code}-${index}`} className="odd:bg-white even:bg-zinc-50 dark:odd:bg-zinc-900 dark:even:bg-zinc-950">
                  {columns.map((column) => (
                    <td key={column} className="max-w-[280px] truncate border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
                      {record[column]}
                    </td>
                  ))}
                </tr>
              ))}
              {!records.length ? (
                <tr>
                  <td className="px-3 py-6 text-zinc-500" colSpan={columns.length}>
                    No records imported.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <details className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <summary className="cursor-pointer font-semibold">Skipped records ({skipped.length})</summary>
        <div className="mt-4 space-y-3">
          {skipped.map((item, index) => (
            <div key={index} className="rounded-md bg-zinc-100 p-3 text-sm dark:bg-zinc-950">
              <p className="font-semibold text-clay">{item.reason}</p>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap text-xs">{JSON.stringify(item.row, null, 2)}</pre>
            </div>
          ))}
          {!skipped.length ? <p className="text-sm text-zinc-600 dark:text-zinc-400">No skipped rows.</p> : null}
        </div>
      </details>
    </section>
  );
}

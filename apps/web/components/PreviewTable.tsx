"use client";

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import type { RawCsvRow } from "@/lib/types";

type Props = {
  rows: RawCsvRow[];
  columns: string[];
};

export function PreviewTable({ rows, columns }: Props) {
  const tableColumns: ColumnDef<RawCsvRow>[] = columns.map((column) => ({
    accessorKey: column,
    header: column,
    cell: (info) => String(info.getValue() ?? "")
  }));

  const table = useReactTable({
    data: rows.slice(0, 100),
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel()
  });

  if (!rows.length) return null;

  return (
    <section className="rounded-md border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 p-4 dark:border-zinc-800">
        <div>
          <h2 className="font-semibold">Raw preview</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {rows.length} rows parsed. Showing first {Math.min(rows.length, 100)}.
          </p>
        </div>
      </div>
      <div className="max-h-[500px] overflow-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead className="sticky top-0 z-10 bg-zinc-100 dark:bg-zinc-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="whitespace-nowrap border-b border-zinc-200 px-3 py-2 font-semibold dark:border-zinc-700">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="odd:bg-white even:bg-zinc-50 dark:odd:bg-zinc-900 dark:even:bg-zinc-950">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="max-w-[280px] truncate border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

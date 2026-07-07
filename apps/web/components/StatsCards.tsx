import type { ImportResponse } from "@/lib/types";

export function StatsCards({ result }: { result: ImportResponse }) {
  const stats = [
    { label: "Total rows", value: result.totalRows, tone: "border-zinc-300" },
    { label: "Imported", value: result.totalImported, tone: "border-leaf" },
    { label: "Skipped", value: result.totalSkipped, tone: "border-clay" }
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className={`rounded-md border-l-4 ${stat.tone} bg-white p-4 shadow-sm dark:bg-zinc-900`}>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{stat.label}</p>
          <p className="mt-1 text-3xl font-semibold">{stat.value}</p>
        </div>
      ))}
    </section>
  );
}

export function ProgressBar({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center justify-between text-sm font-medium">
        <span>{label}</span>
        <span className="text-zinc-500 dark:text-zinc-400">Processing</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-leaf dark:bg-citrus" />
      </div>
    </div>
  );
}

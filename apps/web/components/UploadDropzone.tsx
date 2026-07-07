"use client";

import { FileUp, X } from "lucide-react";
import { useRef, useState } from "react";

type Props = {
  fileName?: string;
  onFile: (file: File) => void;
  onReset: () => void;
};

export function UploadDropzone({ fileName, onFile, onReset }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);

  function acceptFile(files: FileList | null) {
    const file = files?.[0];
    if (file) onFile(file);
  }

  return (
    <section
      onDragOver={(event) => {
        event.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragActive(false);
        acceptFile(event.dataTransfer.files);
      }}
      className={`rounded-md border-2 border-dashed bg-white p-8 text-center shadow-sm transition dark:bg-zinc-900 ${
        dragActive ? "border-leaf" : "border-zinc-300 dark:border-zinc-700"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(event) => acceptFile(event.target.files)}
      />
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-md bg-mist text-leaf dark:bg-zinc-800 dark:text-citrus">
        <FileUp size={24} />
      </div>
      <h2 className="text-lg font-semibold">Upload lead CSV</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
        Drag a CSV here or browse from your computer. The preview is parsed locally before AI processing starts.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="focus-ring rounded-md bg-leaf px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 dark:bg-citrus dark:text-ink dark:hover:bg-lime-200"
        >
          Browse CSV
        </button>
        {fileName ? (
          <button
            type="button"
            onClick={onReset}
            className="focus-ring inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:border-clay dark:border-zinc-700 dark:bg-zinc-900"
          >
            <X size={16} />
            Clear
          </button>
        ) : null}
      </div>
      {fileName ? <p className="mt-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">{fileName}</p> : null}
    </section>
  );
}

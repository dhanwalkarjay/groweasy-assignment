import type { ImportResponse } from "./types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export async function importCsv(file: File): Promise<ImportResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";
  const url = isLocalhost ? "/api/import" : `${apiBaseUrl}/api/import`;
  console.log(">>> [Frontend API] Fetching from:", url);
  
  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData
    });
    console.log(">>> [Frontend API] Fetch response received. Status:", response.status, response.statusText);

    console.log(">>> [Frontend API] Parsing JSON payload...");
    const payload = await response.json();
    console.log(">>> [Frontend API] JSON payload parsed successfully:", payload);

    if (!response.ok) {
      throw new Error(payload.error ?? "Import failed");
    }
    return payload as ImportResponse;
  } catch (error) {
    console.error(">>> [Frontend API] Fetch/Parse failed with error:", error);
    throw error;
  }
}

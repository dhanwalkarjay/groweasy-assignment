// import { GoogleGenerativeAI } from "@google/generative-ai";
// import type { BatchExtractionResponse, RawCsvRow } from "@groweasy/shared";
// import { env } from "../config/env.js";
// import { buildExtractionPrompt, crmResponseSchema } from "../prompts/crmExtraction.prompt.js";
// import { normalizeBatch } from "./crmMapper.service.js";
// import { logger } from "../utils/logger.js";

// const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// function parseJson(text: string) {
//   try {
//     return JSON.parse(text);
//   } catch {
//     const match = text.match(/\{[\s\S]*\}/);
//     if (!match) throw new Error("Gemini response did not contain JSON");
//     return JSON.parse(match[0]);
//   }
// }

// function fallbackExtract(batch: RawCsvRow[]): BatchExtractionResponse {
//   return normalizeBatch(
//     {
//       records: batch.map((row) => {
//         const text = Object.values(row).join(" ");
//         const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
//         const phoneRaw = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0] ?? "";
//         const phoneDigits = phoneRaw.replace(/[^\d+]/g, "").replace(/^\+/, "");
//         return {
//           created_at: "",
//           name: String(row.name ?? row.Name ?? row.full_name ?? row["Lead Name"] ?? ""),
//           email,
//           country_code: phoneRaw.trim().startsWith("+") && phoneDigits.length > 10 ? `+${phoneDigits.slice(0, phoneDigits.length - 10)}` : "",
//           mobile_without_country_code: phoneDigits.length > 10 ? phoneDigits.slice(-10) : phoneDigits,
//           company: String(row.company ?? row.Company ?? ""),
//           city: String(row.city ?? row.City ?? ""),
//           state: String(row.state ?? row.State ?? ""),
//           country: String(row.country ?? row.Country ?? ""),
//           lead_owner: String(row.lead_owner ?? row.Owner ?? row.owner ?? ""),
//           crm_status: "",
//           crm_note: "",
//           data_source: "",
//           possession_time: "",
//           description: String(row.description ?? row.Description ?? row.Notes ?? row.notes ?? "")
//         };
//       }),
//       skipped: []
//     },
//     batch
//   );
// }

// export async function mapBatchWithGemini(batch: RawCsvRow[]): Promise<BatchExtractionResponse> {
//   if (!env.geminiApiKey) {
//     logger.warn("GEMINI_API_KEY is missing; using deterministic fallback extractor");
//     return fallbackExtract(batch);
//   }

//   const model = new GoogleGenerativeAI(env.geminiApiKey).getGenerativeModel({
//     model: env.geminiModel,
//     generationConfig: {
//       temperature: 0.1,
//       responseMimeType: "application/json",
//       responseSchema: crmResponseSchema as never
//     }
//   });

//   for (let attempt = 1; attempt <= 3; attempt += 1) {
//     try {
//       const result = await model.generateContent(buildExtractionPrompt(batch));
//       return normalizeBatch(parseJson(result.response.text()), batch);
//     } catch (error) {
//       logger.warn(`Gemini batch attempt ${attempt} failed`, error);
//       if (attempt === 3) {
//         return {
//           records: [],
//           skipped: batch.map((row) => ({ row, reason: "ai_processing_error" }))
//         };
//       }
//       await sleep(500 * attempt * attempt);
//     }
//   }

//   return { records: [], skipped: [] };
// }







import type { BatchExtractionResponse, RawCsvRow } from "@groweasy/shared";
import { env } from "../config/env.js";
import { buildExtractionPrompt } from "../prompts/crmExtraction.prompt.js";
import { normalizeBatch } from "./crmMapper.service.js";
import { logger } from "../utils/logger.js";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function parseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Model response did not contain JSON");
    return JSON.parse(match[0]);
  }
}

function fallbackExtract(batch: RawCsvRow[]): BatchExtractionResponse {
  return normalizeBatch(
    {
      records: batch.map((row) => {
        const text = Object.values(row).join(" ");
        const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
        const phoneRaw = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0] ?? "";
        const phoneDigits = phoneRaw.replace(/[^\d+]/g, "").replace(/^\+/, "");
        return {
          created_at: "",
          name: String(row.name ?? row.Name ?? row.full_name ?? row["Lead Name"] ?? ""),
          email,
          country_code: phoneRaw.trim().startsWith("+") && phoneDigits.length > 10 ? `+${phoneDigits.slice(0, phoneDigits.length - 10)}` : "",
          mobile_without_country_code: phoneDigits.length > 10 ? phoneDigits.slice(-10) : phoneDigits,
          company: String(row.company ?? row.Company ?? ""),
          city: String(row.city ?? row.City ?? ""),
          state: String(row.state ?? row.State ?? ""),
          country: String(row.country ?? row.Country ?? ""),
          lead_owner: String(row.lead_owner ?? row.Owner ?? row.owner ?? ""),
          crm_status: "",
          crm_note: "",
          data_source: "",
          possession_time: "",
          description: String(row.description ?? row.Description ?? row.Notes ?? row.notes ?? "")
        };
      }),
      skipped: []
    },
    batch
  );
}

export async function mapBatchWithGroq(batch: RawCsvRow[]): Promise<BatchExtractionResponse> {
  if (!env.groqApiKey) {
    logger.warn("GROQ_API_KEY is missing; using deterministic fallback extractor");
    return fallbackExtract(batch);
  }

  const prompt = buildExtractionPrompt(batch);

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20_000);

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.groqApiKey}`
        },
        body: JSON.stringify({
          model: env.groqModel, // e.g. "llama-3.3-70b-versatile"
          temperature: 0.1,
          response_format: { type: "json_object" },
          messages: [{ role: "user", content: prompt }]
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Groq error ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content ?? "";
      return normalizeBatch(parseJson(text), batch);
    } catch (error) {
      logger.warn(`Groq batch attempt ${attempt} failed`, error);
      if (attempt === 3) {
        return {
          records: [],
          skipped: batch.map((row) => ({ row, reason: "ai_processing_error" }))
        };
      }
      await sleep(500 * attempt * attempt);
    }
  }

  return { records: [], skipped: [] };
}
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../../.env") });

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const env = {
  port: toNumber(process.env.PORT, 4000),
  groqApiKey: process.env.GROQ_API_KEY ?? "",
  groqModel: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
  batchSize: toNumber(process.env.BATCH_SIZE, 25),
  maxConcurrentBatches: toNumber(process.env.MAX_CONCURRENT_BATCHES, 3),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000"
};
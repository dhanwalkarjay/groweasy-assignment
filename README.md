# GrowEasy AI CSV Importer

AI-powered CSV importer that previews arbitrary lead CSVs and maps messy columns into the GrowEasy CRM schema with Groq.

## Architecture

```text
Next.js web app -> Express API -> CSV parser -> batcher -> Groq -> Zod validation -> mapped CRM JSON
```

## Tech Stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| CSV preview | PapaParse |
| Tables | TanStack React Table |
| Backend | Node.js, Express, TypeScript |
| AI | Groq (Llama 3.3) |
| Validation | Zod shared schema |
| Tests | Vitest |

## Local Setup

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
npm run build --workspace @groweasy/shared
npm run dev --workspace @groweasy/api
npm run dev --workspace @groweasy/web
```

The app runs at `http://localhost:3000`; the API runs at `http://localhost:4000`.

Set `GROQ_API_KEY` in `apps/api/.env` for real AI mapping. Without a key, the API uses a deterministic fallback extractor so the upload flow still works locally.

## API

`POST /api/import`

Content type: `multipart/form-data`

Field: `file`, a `.csv` up to 5MB.

Response:

```json
{
  "success": true,
  "totalRows": 3,
  "totalImported": 2,
  "totalSkipped": 1,
  "records": [],
  "skipped": []
}
```

## AI Mapping

The backend sends each CSV batch to Groq with a strict CRM extraction prompt and JSON response format. The prompt defines all target fields, allowed enums, skip rules, date requirements, and few-shot examples for common messy exports. The backend then validates every AI record with Zod and applies safety checks:

- unknown `crm_status` and `data_source` values are rejected by schema validation
- rows with no email and no mobile are skipped
- invalid dates are blanked instead of failing the import
- extra emails and phones found in source rows are appended to `crm_note`
- failed AI batches become skipped rows with `ai_processing_error`

## Folder Structure

```text
apps/web       Next.js frontend
apps/api       Express backend
packages/shared  shared Zod schemas and TypeScript contracts
```

## Tests

```bash
npm test --workspace @groweasy/api
```

Fixtures for messy CSV validation live in `apps/api/tests/fixtures`.

## Docker

```bash
docker compose up --build
```

Create `apps/api/.env` before running Docker.

## Deployment

Backend: deploy `apps/api` to Render with `npm install && npm run build --workspace @groweasy/shared && npm run build --workspace @groweasy/api`, start command `npm start --workspace @groweasy/api`, and set the API environment variables.

Frontend: deploy `apps/web` to Vercel and set `NEXT_PUBLIC_API_BASE_URL` to the Render backend URL. Update `CORS_ORIGIN` on the backend to the Vercel domain.

## Limitations

- Progress is currently an indeterminate loading state, not SSE batch streaming.
- The fallback extractor is intentionally basic; Gemini is required for high-quality ambiguous column mapping.
- Files are processed in memory with a 5MB upload limit for free-tier deployment simplicity.

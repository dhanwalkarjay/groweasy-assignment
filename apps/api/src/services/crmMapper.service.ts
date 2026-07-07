import {
  CrmRecordSchema,
  crmStatuses,
  dataSources,
  type BatchExtractionResponse,
  type CrmRecord,
  type RawCsvRow,
  type SkippedRecord,
  emptyCrmRecord
} from "@groweasy/shared";
import { z } from "zod";

const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const phoneRegex = /(?:\+?\d[\d\s().-]{7,}\d)/g;

const RawAiRecordSchema = z.object({
  created_at: z.string().default(""),
  name: z.string().default(""),
  email: z.string().default(""),
  country_code: z.string().default(""),
  mobile_without_country_code: z.string().default(""),
  company: z.string().default(""),
  city: z.string().default(""),
  state: z.string().default(""),
  country: z.string().default(""),
  lead_owner: z.string().default(""),
  crm_status: z.string().default(""),
  crm_note: z.string().default(""),
  data_source: z.string().default(""),
  possession_time: z.string().default(""),
  description: z.string().default("")
});

const RawBatchExtractionResponseSchema = z.object({
  records: z.array(RawAiRecordSchema).default([]),
  skipped: z
    .array(
      z.object({
        row: z.record(z.unknown()),
        reason: z.string()
      })
    )
    .default([])
});

function cleanPhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

function extractCountryCode(phone: string) {
  const cleaned = cleanPhone(phone);
  if (cleaned.startsWith("+")) {
    const withoutPlus = cleaned.slice(1);
    if (withoutPlus.length > 10) {
      return `+${withoutPlus.slice(0, withoutPlus.length - 10)}`;
    }
  }
  return "";
}

function extractMobile(phone: string) {
  const digits = cleanPhone(phone).replace(/^\+/, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function appendNote(note: string, addition: string) {
  if (!addition) return note;
  return note ? `${note}; ${addition}` : addition;
}

function sweepRawContactInfo(record: CrmRecord, row: RawCsvRow): CrmRecord {
  const text = Object.values(row).join(" ");
  const emails = [...new Set(text.match(emailRegex) ?? [])];
  const phones = [...new Set(text.match(phoneRegex)?.map(cleanPhone) ?? [])];
  const next = { ...record };

  if (!next.email && emails[0]) {
    next.email = emails[0];
  }
  const extraEmails = emails.filter((email) => email !== next.email);
  if (extraEmails.length > 0) {
    next.crm_note = appendNote(next.crm_note, `extra emails: ${extraEmails.join(", ")}`);
  }

  if (!next.mobile_without_country_code && phones[0]) {
    next.country_code = next.country_code || extractCountryCode(phones[0]);
    next.mobile_without_country_code = extractMobile(phones[0]);
  }
  const extraPhones = phones.map(extractMobile).filter((phone) => phone && phone !== next.mobile_without_country_code);
  if (extraPhones.length > 0) {
    next.crm_note = appendNote(next.crm_note, `extra phones: ${extraPhones.join(", ")}`);
  }

  return next;
}

function normalizeDate(record: CrmRecord): CrmRecord {
  if (!record.created_at) return record;
  const parsed = new Date(record.created_at);
  return Number.isNaN(parsed.getTime()) ? { ...record, created_at: "" } : record;
}

function normalizeEnums(record: z.infer<typeof RawAiRecordSchema>): CrmRecord {
  const crmStatus = crmStatuses.includes(record.crm_status as never) ? record.crm_status : "";
  const dataSource = dataSources.includes(record.data_source as never) ? record.data_source : "";

  return {
    ...record,
    crm_status: crmStatus,
    data_source: dataSource
  } as CrmRecord;
}

export function normalizeBatch(aiResponse: unknown, sourceRows: RawCsvRow[]): BatchExtractionResponse {
  const parsed = RawBatchExtractionResponseSchema.safeParse(aiResponse);
  if (!parsed.success) {
    return {
      records: [],
      skipped: sourceRows.map((row) => ({ row, reason: "ai_response_validation_failed" }))
    };
  }

  const skipped: SkippedRecord[] = [...parsed.data.skipped];
  const records: CrmRecord[] = [];

  parsed.data.records.forEach((record, index) => {
    const sourceRow = sourceRows[index] ?? {};
    const swept = normalizeDate(sweepRawContactInfo({ ...emptyCrmRecord, ...normalizeEnums(record) }, sourceRow));
    const hasContact = Boolean(swept.email || swept.mobile_without_country_code);
    const valid = CrmRecordSchema.safeParse(swept);

    if (!hasContact) {
      skipped.push({ row: sourceRow, reason: "missing_contact_info" });
      return;
    }
    if (!valid.success) {
      skipped.push({ row: sourceRow, reason: "crm_record_validation_failed" });
      return;
    }
    records.push(valid.data);
  });

  return { records, skipped };
}

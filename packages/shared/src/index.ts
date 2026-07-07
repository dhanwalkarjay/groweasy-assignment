import { z } from "zod";

export const crmStatuses = [
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
  ""
] as const;

export const dataSources = [
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
  ""
] as const;

export const CrmRecordSchema = z.object({
  created_at: z.string(),
  name: z.string(),
  email: z.string(),
  country_code: z.string(),
  mobile_without_country_code: z.string(),
  company: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  lead_owner: z.string(),
  crm_status: z.enum(crmStatuses),
  crm_note: z.string(),
  data_source: z.enum(dataSources),
  possession_time: z.string(),
  description: z.string()
});

export const SkippedRecordSchema = z.object({
  row: z.record(z.unknown()),
  reason: z.string()
});

export const BatchExtractionResponseSchema = z.object({
  records: z.array(CrmRecordSchema),
  skipped: z.array(SkippedRecordSchema)
});

export const ImportResponseSchema = z.object({
  success: z.boolean(),
  totalRows: z.number(),
  totalImported: z.number(),
  totalSkipped: z.number(),
  records: z.array(CrmRecordSchema),
  skipped: z.array(SkippedRecordSchema)
});

export type CrmStatus = (typeof crmStatuses)[number];
export type DataSource = (typeof dataSources)[number];
export type CrmRecord = z.infer<typeof CrmRecordSchema>;
export type SkippedRecord = z.infer<typeof SkippedRecordSchema>;
export type BatchExtractionResponse = z.infer<typeof BatchExtractionResponseSchema>;
export type ImportResponse = z.infer<typeof ImportResponseSchema>;
export type RawCsvRow = Record<string, string>;

export const emptyCrmRecord: CrmRecord = {
  created_at: "",
  name: "",
  email: "",
  country_code: "",
  mobile_without_country_code: "",
  company: "",
  city: "",
  state: "",
  country: "",
  lead_owner: "",
  crm_status: "",
  crm_note: "",
  data_source: "",
  possession_time: "",
  description: ""
};

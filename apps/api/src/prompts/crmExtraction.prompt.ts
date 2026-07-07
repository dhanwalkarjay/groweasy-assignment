import type { RawCsvRow } from "@groweasy/shared";

export const crmResponseSchema = {
  type: "object",
  properties: {
    records: {
      type: "array",
      items: {
        type: "object",
        properties: {
          created_at: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          country_code: { type: "string" },
          mobile_without_country_code: { type: "string" },
          company: { type: "string" },
          city: { type: "string" },
          state: { type: "string" },
          country: { type: "string" },
          lead_owner: { type: "string" },
          crm_status: { type: "string" },
          crm_note: { type: "string" },
          data_source: { type: "string" },
          possession_time: { type: "string" },
          description: { type: "string" }
        },
        required: [
          "created_at",
          "name",
          "email",
          "country_code",
          "mobile_without_country_code",
          "company",
          "city",
          "state",
          "country",
          "lead_owner",
          "crm_status",
          "crm_note",
          "data_source",
          "possession_time",
          "description"
        ]
      }
    },
    skipped: {
      type: "array",
      items: {
        type: "object",
        properties: {
          row: { type: "object" },
          reason: { type: "string" }
        },
        required: ["row", "reason"]
      }
    }
  },
  required: ["records", "skipped"]
} as const;

export function buildExtractionPrompt(batch: RawCsvRow[]) {
  return `
You are an expert CRM data-mapping engine for GrowEasy. You receive raw lead rows from arbitrary CSV files with unknown headers and inconsistent formats. Map each source row into the exact CRM JSON shape below.

TARGET SCHEMA:
- created_at: lead creation date/time; output ISO 8601 or empty string.
- name: person's full name.
- email: first valid email only.
- country_code: phone country code such as +91, or empty string.
- mobile_without_country_code: first mobile number without country code.
- company: company or organization.
- city: city.
- state: state or region.
- country: country.
- lead_owner: owner, assignee, salesperson, or agent.
- crm_status: one of GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE, or empty string.
- crm_note: extra context, extra emails/phones, campaign info, unmapped useful details.
- data_source: one of leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots, or empty string.
- possession_time: possession timeline, move-in timeline, or property possession date.
- description: lead message, requirement, comments, or summary.

RULES:
1. Never invent data. If a field is missing or uncertain, use "".
2. If no email and no mobile number can be found, put that row in skipped with reason "missing_contact_info".
3. Put only the first email in email and only the first phone in mobile_without_country_code. Put additional emails or phones in crm_note.
4. Normalize crm_status and data_source only when confident; otherwise use "".
5. created_at must be parseable by JavaScript new Date(...). Prefer ISO 8601.
6. Return JSON only. No markdown, no explanation.

FEW-SHOT EXAMPLES:
Input: {"full_name":"Asha Rao","email_address":"asha@example.com","phone_number":"+91 98765 43210","campaign_name":"Eden Park launch","created_time":"2026-07-01 09:30"}
Output record: {"created_at":"2026-07-01T09:30:00","name":"Asha Rao","email":"asha@example.com","country_code":"+91","mobile_without_country_code":"9876543210","company":"","city":"","state":"","country":"","lead_owner":"","crm_status":"","crm_note":"campaign_name: Eden Park launch","data_source":"eden_park","possession_time":"","description":""}

Input: {"Lead Name":"Kiran M","Contact Info":"kiran@example.com / +91-9000011111, alt: kiran.work@example.com","Ad Group":"Sarjapur plots","Date":"07/02/2026","Notes":"Wants corner plot"}
Output record: {"created_at":"2026-07-02T00:00:00","name":"Kiran M","email":"kiran@example.com","country_code":"+91","mobile_without_country_code":"9000011111","company":"","city":"","state":"","country":"","lead_owner":"","crm_status":"","crm_note":"extra email: kiran.work@example.com; Ad Group: Sarjapur plots","data_source":"sarjapur_plots","possession_time":"","description":"Wants corner plot"}

Input: {"Name / Phone":"No Contact Person","Remarks":"interested but no contact"}
Output skipped: {"row":{"Name / Phone":"No Contact Person","Remarks":"interested but no contact"},"reason":"missing_contact_info"}

Map these ${batch.length} raw records. Return exactly:
{"records":[...],"skipped":[{"row":{...},"reason":"..."}]}

RAW RECORDS:
${JSON.stringify(batch)}
`;
}

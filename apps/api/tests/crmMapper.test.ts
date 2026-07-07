import { describe, expect, it } from "vitest";
import { normalizeBatch } from "../src/services/crmMapper.service.js";

const validRecord = {
  created_at: "not a date",
  name: "Asha Rao",
  email: "",
  country_code: "",
  mobile_without_country_code: "",
  company: "",
  city: "",
  state: "",
  country: "",
  lead_owner: "",
  crm_status: "GOOD_LEAD_FOLLOW_UP",
  crm_note: "",
  data_source: "eden_park",
  possession_time: "",
  description: ""
};

describe("normalizeBatch", () => {
  it("sweeps missing email and phone from the source row", () => {
    const result = normalizeBatch(
      { records: [validRecord], skipped: [] },
      [{ contact: "asha@example.com +91 98765 43210" }]
    );

    expect(result.records).toHaveLength(1);
    expect(result.records[0]?.email).toBe("asha@example.com");
    expect(result.records[0]?.country_code).toBe("+91");
    expect(result.records[0]?.mobile_without_country_code).toBe("9876543210");
  });

  it("skips records without contact information", () => {
    const result = normalizeBatch({ records: [validRecord], skipped: [] }, [{ name: "No Contact" }]);

    expect(result.records).toHaveLength(0);
    expect(result.skipped[0]?.reason).toBe("missing_contact_info");
  });

  it("blanks invalid dates instead of skipping the record", () => {
    const result = normalizeBatch(
      { records: [{ ...validRecord, email: "asha@example.com" }], skipped: [] },
      [{ email: "asha@example.com" }]
    );

    expect(result.records[0]?.created_at).toBe("");
  });

  it("normalizes unknown AI enum values to blank strings", () => {
    const result = normalizeBatch(
      {
        records: [
          {
            ...validRecord,
            email: "asha@example.com",
            crm_status: "CALL_LATER",
            data_source: "facebook_ads"
          }
        ],
        skipped: []
      },
      [{ email: "asha@example.com" }]
    );

    expect(result.records[0]?.crm_status).toBe("");
    expect(result.records[0]?.data_source).toBe("");
  });
});

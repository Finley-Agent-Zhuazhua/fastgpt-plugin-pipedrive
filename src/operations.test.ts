import { afterEach, describe, expect, it, vi } from "vitest";
import { createRecord, getRecord, listRecords, searchRecords, updateRecord } from "./operations";

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Pipedrive operations", () => {
  it("formats list and search output", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({
        success: true,
        data: [{ id: 1, name: "Ada" }],
        additional_data: { pagination: { next_start: 10 } },
      }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: [{ id: 2, name: "Acme" }] }));

    await expect(listRecords({ apiToken: "test-token", entity: "persons", limit: 5 })).resolves.toEqual({
      success: true,
      data: [{ id: 1, name: "Ada" }],
      pagination: { next_start: 10 },
    });
    await expect(searchRecords({ apiToken: "test-token", entity: "organizations", term: "Acme" })).resolves.toEqual({
      success: true,
      data: [{ id: 2, name: "Acme" }],
    });
  });

  it("formats get, create, and update output", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { id: 4, title: "Deal" } }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { id: 5, title: "Lead" } }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { id: 5, title: "Updated lead" } }));

    await expect(getRecord({ apiToken: "test-token", entity: "deals", recordId: "4" })).resolves.toEqual({
      success: true,
      data: { id: 4, title: "Deal" },
    });
    await expect(createRecord({ apiToken: "test-token", entity: "leads", data: { title: "Lead" } })).resolves.toEqual({
      success: true,
      data: { id: 5, title: "Lead" },
    });
    await expect(updateRecord({ apiToken: "test-token", entity: "leads", recordId: "5", data: { title: "Updated lead" } })).resolves.toEqual({
      success: true,
      data: { id: 5, title: "Updated lead" },
    });
  });
});

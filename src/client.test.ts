import { afterEach, describe, expect, it, vi } from "vitest";
import { PipedriveClient } from "./client";

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Pipedrive client", () => {
  it("builds a list request with the fixed endpoint, token, filters, and pagination", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      success: true,
      data: [{ id: 7, name: "Ada" }],
      additional_data: { pagination: { more_items_in_collection: false } },
    }));
    const client = new PipedriveClient({ apiToken: "test-token", fetchFn: fetchMock });

    await expect(client.list("persons", {
      start: 10,
      limit: 20,
      sort: "add_time DESC",
      ownerId: 4,
      organizationId: 8,
      status: "open",
    })).resolves.toEqual({
      data: [{ id: 7, name: "Ada" }],
      pagination: { more_items_in_collection: false },
    });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    const parsed = new URL(String(url));
    expect(`${parsed.origin}${parsed.pathname}`).toBe("https://api.pipedrive.com/v1/persons");
    expect(parsed.searchParams.get("api_token")).toBe("test-token");
    expect(parsed.searchParams.get("start")).toBe("10");
    expect(parsed.searchParams.get("limit")).toBe("20");
    expect(parsed.searchParams.get("owner_id")).toBe("4");
    expect(parsed.searchParams.get("org_id")).toBe("8");
    expect(parsed.searchParams.get("status")).toBe("open");
    expect(init?.method).toBe("GET");
    expect((init?.headers as Record<string, string>).Accept).toBe("application/json");
  });

  it("builds search, read, create, and update requests", async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ success: true, data: [{ id: 1 }] }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { id: 1, name: "Ada" } }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { id: 2, name: "Grace" } }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { id: 2, name: "Grace Hopper" } }));
    const client = new PipedriveClient({ apiToken: "test-token", fetchFn: fetchMock });

    await client.search("organizations", { term: "Acme & Sons", fields: "name,address", exactMatch: true, limit: 5 });
    await client.get("deals", "42");
    await client.create("leads", { title: "New lead", value: 100 });
    await client.update("persons", "2", { name: "Grace Hopper" });

    const searchUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(searchUrl.pathname).toBe("/v1/organizations/search");
    expect(searchUrl.searchParams.get("term")).toBe("Acme & Sons");
    expect(searchUrl.searchParams.get("fields")).toBe("name,address");
    expect(searchUrl.searchParams.get("exact_match")).toBe("true");
    expect(fetchMock.mock.calls[1]?.[1]?.method).toBe("GET");
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("/v1/deals/42");
    expect(fetchMock.mock.calls[2]?.[1]?.method).toBe("POST");
    expect(JSON.parse(String(fetchMock.mock.calls[2]?.[1]?.body))).toEqual({ title: "New lead", value: 100 });
    expect(fetchMock.mock.calls[3]?.[1]?.method).toBe("PUT");
    expect(String(fetchMock.mock.calls[3]?.[0])).toContain("/v1/persons/2");
  });

  it("surfaces API-level and HTTP errors without exposing a fake success", async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ success: false, error_info: "Invalid API token" }))
      .mockResolvedValueOnce(jsonResponse({ success: false, error: "Unauthorized" }, 401));
    const client = new PipedriveClient({ apiToken: "test-token", fetchFn: fetchMock });

    await expect(client.list("deals", {})).rejects.toThrow("Invalid API token");
    await expect(client.list("deals", {})).rejects.toThrow("Unauthorized");
  });
});

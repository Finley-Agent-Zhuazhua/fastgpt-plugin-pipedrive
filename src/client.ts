import type {
  JsonObject,
  JsonValue,
  ListRecordsQuery,
  PipedriveEntity,
  SearchRecordsQuery,
} from "./types";

const PIPEDRIVE_API_BASE = "https://api.pipedrive.com/v1";

type HttpMethod = "GET" | "POST" | "PUT";

export interface PipedriveClientOptions {
  apiToken: string;
  fetchFn?: typeof fetch;
}

export interface ListResponse {
  data: unknown;
  pagination?: JsonObject | undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function asJsonObject(value: unknown): JsonObject | undefined {
  const record = asRecord(value);
  return Object.keys(record).length > 0 ? record as JsonObject : undefined;
}

function validateRecordId(value: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error("Record ID is required");
  if (/[/?#]/.test(normalized)) throw new Error("Record ID must not contain '/', '?', or '#' characters");
  return normalized;
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  const record = asRecord(payload);
  for (const key of ["error_info", "error", "message"]) {
    if (typeof record[key] === "string" && record[key]) return record[key] as string;
  }
  return fallback;
}

function appendNumber(params: URLSearchParams, key: string, value: number | undefined): void {
  if (value !== undefined) params.set(key, String(value));
}

function appendString(params: URLSearchParams, key: string, value: string | undefined): void {
  const normalized = value?.trim();
  if (normalized) params.set(key, normalized);
}

export class PipedriveClient {
  private readonly apiToken: string;
  private readonly fetchFn: typeof fetch;

  constructor(options: PipedriveClientOptions) {
    const apiToken = options.apiToken.trim();
    if (!apiToken) throw new Error("Pipedrive API token is required");
    this.apiToken = apiToken;
    this.fetchFn = options.fetchFn ?? fetch;
  }

  private async request(method: HttpMethod, path: string, body?: JsonObject, params?: URLSearchParams): Promise<unknown> {
    const url = new URL(`${PIPEDRIVE_API_BASE}${path}`);
    if (params) {
      params.forEach((value, key) => url.searchParams.set(key, value));
    }
    url.searchParams.set("api_token", this.apiToken);

    const headers: Record<string, string> = { Accept: "application/json" };
    const init: RequestInit = { method, headers };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }

    const response = await this.fetchFn(url, init);
    const text = await response.text();
    let payload: unknown = {};
    if (text) {
      try {
        payload = JSON.parse(text) as unknown;
      } catch {
        payload = { message: text };
      }
    }

    const envelope = asRecord(payload);
    if (!response.ok) {
      throw new Error(`Pipedrive API ${method} ${path} failed: ${extractErrorMessage(payload, response.statusText || `HTTP ${response.status}`)}`);
    }
    if (envelope.success === false) {
      throw new Error(`Pipedrive API ${method} ${path} failed: ${extractErrorMessage(payload, "API returned success=false")}`);
    }
    return payload;
  }

  private listParams(input: ListRecordsQuery): URLSearchParams {
    const params = new URLSearchParams();
    appendNumber(params, "start", input.start);
    appendNumber(params, "limit", input.limit);
    appendString(params, "sort", input.sort);
    appendNumber(params, "filter_id", input.filterId);
    appendNumber(params, "owner_id", input.ownerId);
    appendNumber(params, "user_id", input.userId);
    appendNumber(params, "org_id", input.organizationId);
    appendNumber(params, "person_id", input.personId);
    appendNumber(params, "stage_id", input.stageId);
    appendNumber(params, "pipeline_id", input.pipelineId);
    appendString(params, "status", input.status);
    return params;
  }

  private pagination(payload: unknown): JsonObject | undefined {
    const additionalData = asRecord(asRecord(payload).additional_data);
    return asJsonObject(additionalData.pagination);
  }

  async list(entity: PipedriveEntity, input: ListRecordsQuery): Promise<ListResponse> {
    const payload = await this.request("GET", `/${entity}`, undefined, this.listParams(input));
    return { data: asRecord(payload).data, pagination: this.pagination(payload) };
  }

  async search(entity: PipedriveEntity, input: SearchRecordsQuery): Promise<ListResponse> {
    const term = input.term.trim();
    if (!term) throw new Error("Search term is required");
    const params = new URLSearchParams({ term });
    appendString(params, "fields", input.fields);
    if (input.exactMatch !== undefined) params.set("exact_match", String(input.exactMatch));
    appendNumber(params, "start", input.start);
    appendNumber(params, "limit", input.limit);
    const payload = await this.request("GET", `/${entity}/search`, undefined, params);
    return { data: asRecord(payload).data, pagination: this.pagination(payload) };
  }

  async get(entity: PipedriveEntity, recordId: string): Promise<unknown> {
    const payload = await this.request("GET", `/${entity}/${encodeURIComponent(validateRecordId(recordId))}`);
    return asRecord(payload).data;
  }

  async create(entity: PipedriveEntity, data: JsonObject): Promise<unknown> {
    const payload = await this.request("POST", `/${entity}`, data);
    return asRecord(payload).data;
  }

  async update(entity: PipedriveEntity, recordId: string, data: JsonObject): Promise<unknown> {
    const payload = await this.request("PUT", `/${entity}/${encodeURIComponent(validateRecordId(recordId))}`, data);
    return asRecord(payload).data;
  }
}

export { PIPEDRIVE_API_BASE };
export type { JsonValue };

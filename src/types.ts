export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

export type PipedriveEntity = "persons" | "organizations" | "deals" | "leads";

export interface ListRecordsQuery {
  start?: number | undefined;
  limit?: number | undefined;
  sort?: string | undefined;
  filterId?: number | undefined;
  ownerId?: number | undefined;
  userId?: number | undefined;
  organizationId?: number | undefined;
  personId?: number | undefined;
  stageId?: number | undefined;
  pipelineId?: number | undefined;
  status?: string | undefined;
}

export interface SearchRecordsQuery {
  term: string;
  fields?: string | undefined;
  exactMatch?: boolean | undefined;
  start?: number | undefined;
  limit?: number | undefined;
}

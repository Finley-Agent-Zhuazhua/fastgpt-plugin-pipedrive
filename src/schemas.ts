import type {
  InputSchemaMetaType,
  OutputSchemaMetaType,
  SecretSchemaMetaType,
} from "@fastgpt-plugin/sdk-factory";
import z from "zod";
import type { JsonObject, JsonValue, PipedriveEntity } from "./types";

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() => z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(jsonValueSchema),
  z.record(z.string(), jsonValueSchema),
]));

const jsonObjectSchema: z.ZodType<JsonObject> = z.record(z.string(), jsonValueSchema);
const nonEmptyJsonObjectSchema = jsonObjectSchema.refine(
  (value) => Object.keys(value).length > 0,
  "Data must contain at least one property.",
);

const entitySchema = z.enum(["persons", "organizations", "deals", "leads"]).meta({
  title: "Entity",
  description: "Pipedrive resource. Use persons for contacts.",
  toolDescription: "Pipedrive resource: persons (contacts), organizations, deals, or leads.",
} satisfies InputSchemaMetaType);

const recordIdSchema = z.string().min(1).max(128).refine(
  (value) => !/[/?#]/.test(value),
  "Record ID must not contain '/', '?', or '#' characters.",
).meta({
  title: "Record ID",
  description: "Pipedrive record ID.",
  toolDescription: "The ID of the Pipedrive record.",
} satisfies InputSchemaMetaType);

export const secretSchema = z.object({
  apiToken: z.string().min(1).meta({
    title: "Pipedrive API token",
    description: "Personal API token from Pipedrive settings.",
    isSecret: true,
  } satisfies SecretSchemaMetaType),
});

export const listRecordsInputSchema = z.object({
  entity: entitySchema,
  start: z.number().int().min(0).max(1_000_000).optional().meta({
    title: "Start",
    description: "Zero-based pagination offset.",
    toolDescription: "Optional pagination offset.",
  } satisfies InputSchemaMetaType),
  limit: z.number().int().min(1).max(100).optional().meta({
    title: "Limit",
    description: "Maximum records to return, from 1 to 100.",
    toolDescription: "Optional page size.",
  } satisfies InputSchemaMetaType),
  sort: z.string().min(1).max(128).optional().meta({
    title: "Sort",
    description: "Pipedrive sort expression, for example add_time DESC.",
    toolDescription: "Optional Pipedrive sort expression.",
  } satisfies InputSchemaMetaType),
  filterId: z.number().int().positive().optional().meta({
    title: "Filter ID",
    description: "Optional Pipedrive filter ID.",
    toolDescription: "Filter records with a saved Pipedrive filter.",
  } satisfies InputSchemaMetaType),
  ownerId: z.number().int().positive().optional().meta({
    title: "Owner ID",
    description: "Optional Pipedrive owner user ID.",
    toolDescription: "Filter records by owner.",
  } satisfies InputSchemaMetaType),
  userId: z.number().int().positive().optional().meta({
    title: "User ID",
    description: "Optional Pipedrive user ID.",
    toolDescription: "Filter records by user where supported.",
  } satisfies InputSchemaMetaType),
  organizationId: z.number().int().positive().optional().meta({
    title: "Organization ID",
    description: "Optional related organization ID.",
    toolDescription: "Filter records by related organization.",
  } satisfies InputSchemaMetaType),
  personId: z.number().int().positive().optional().meta({
    title: "Person ID",
    description: "Optional related person ID.",
    toolDescription: "Filter records by related person.",
  } satisfies InputSchemaMetaType),
  stageId: z.number().int().positive().optional().meta({
    title: "Stage ID",
    description: "Optional deal stage ID.",
    toolDescription: "Filter deals by stage.",
  } satisfies InputSchemaMetaType),
  pipelineId: z.number().int().positive().optional().meta({
    title: "Pipeline ID",
    description: "Optional deal pipeline ID.",
    toolDescription: "Filter deals by pipeline.",
  } satisfies InputSchemaMetaType),
  status: z.string().min(1).max(64).optional().meta({
    title: "Status",
    description: "Optional Pipedrive status such as open, won, lost, or deleted.",
    toolDescription: "Filter records by status.",
  } satisfies InputSchemaMetaType),
});

export const searchRecordsInputSchema = z.object({
  entity: entitySchema,
  term: z.string().min(1).max(3000).meta({
    title: "Search term",
    description: "Text to search for.",
    toolDescription: "Text to search in Pipedrive records.",
  } satisfies InputSchemaMetaType),
  fields: z.string().min(1).max(128).optional().meta({
    title: "Fields",
    description: "Optional comma-separated Pipedrive search fields.",
    toolDescription: "Optional fields to search, for example name,email,phone.",
  } satisfies InputSchemaMetaType),
  exactMatch: z.boolean().optional().meta({
    title: "Exact match",
    description: "Whether the term must match exactly.",
    toolDescription: "Use exact matching when true.",
  } satisfies InputSchemaMetaType),
  start: z.number().int().min(0).max(1_000_000).optional().meta({
    title: "Start",
    description: "Zero-based pagination offset.",
    toolDescription: "Optional pagination offset.",
  } satisfies InputSchemaMetaType),
  limit: z.number().int().min(1).max(100).optional().meta({
    title: "Limit",
    description: "Maximum search results, from 1 to 100.",
    toolDescription: "Optional search page size.",
  } satisfies InputSchemaMetaType),
});

export const getRecordInputSchema = z.object({
  entity: entitySchema,
  recordId: recordIdSchema,
});

export const createRecordInputSchema = z.object({
  entity: entitySchema,
  data: nonEmptyJsonObjectSchema.meta({
    title: "Record data",
    description: "Pipedrive fields to send to the create endpoint.",
    toolDescription: "JSON properties for the new record, such as name or title.",
  } satisfies InputSchemaMetaType),
});

export const updateRecordInputSchema = z.object({
  entity: entitySchema,
  recordId: recordIdSchema,
  data: nonEmptyJsonObjectSchema.meta({
    title: "Record data",
    description: "Pipedrive fields to update.",
    toolDescription: "JSON properties to patch on the existing record.",
  } satisfies InputSchemaMetaType),
});

export const listOutputSchema = z.object({
  success: z.literal(true).meta({ title: "Success" } satisfies OutputSchemaMetaType),
  data: z.unknown().meta({ title: "Records" } satisfies OutputSchemaMetaType),
  pagination: z.unknown().optional().meta({ title: "Pagination" } satisfies OutputSchemaMetaType),
});

export const recordOutputSchema = z.object({
  success: z.literal(true).meta({ title: "Success" } satisfies OutputSchemaMetaType),
  data: z.unknown().meta({ title: "Record" } satisfies OutputSchemaMetaType),
});

export type PipedriveSecrets = z.output<typeof secretSchema>;
export type ListRecordsInput = z.output<typeof listRecordsInputSchema>;
export type SearchRecordsInput = z.output<typeof searchRecordsInputSchema>;
export type GetRecordInput = z.output<typeof getRecordInputSchema>;
export type CreateRecordInput = z.output<typeof createRecordInputSchema>;
export type UpdateRecordInput = z.output<typeof updateRecordInputSchema>;
export type ListOutput = z.output<typeof listOutputSchema>;
export type RecordOutput = z.output<typeof recordOutputSchema>;
export type { PipedriveEntity };

import { PipedriveClient } from "./client";
import type {
  CreateRecordInput,
  GetRecordInput,
  ListOutput,
  ListRecordsInput,
  PipedriveSecrets,
  RecordOutput,
  SearchRecordsInput,
  UpdateRecordInput,
} from "./schemas";

function createClient(input: PipedriveSecrets): PipedriveClient {
  return new PipedriveClient({ apiToken: input.apiToken });
}

export async function listRecords(input: ListRecordsInput & PipedriveSecrets): Promise<ListOutput> {
  const { apiToken, entity, ...query } = input;
  const result = await createClient({ apiToken }).list(entity, query);
  return {
    success: true,
    data: result.data,
    ...(result.pagination ? { pagination: result.pagination } : {}),
  };
}

export async function searchRecords(input: SearchRecordsInput & PipedriveSecrets): Promise<ListOutput> {
  const { apiToken, entity, ...query } = input;
  const result = await createClient({ apiToken }).search(entity, query);
  return {
    success: true,
    data: result.data,
    ...(result.pagination ? { pagination: result.pagination } : {}),
  };
}

export async function getRecord(input: GetRecordInput & PipedriveSecrets): Promise<RecordOutput> {
  const { apiToken, entity, recordId } = input;
  return { success: true, data: await createClient({ apiToken }).get(entity, recordId) };
}

export async function createRecord(input: CreateRecordInput & PipedriveSecrets): Promise<RecordOutput> {
  const { apiToken, entity, data } = input;
  return { success: true, data: await createClient({ apiToken }).create(entity, data) };
}

export async function updateRecord(input: UpdateRecordInput & PipedriveSecrets): Promise<RecordOutput> {
  const { apiToken, entity, recordId, data } = input;
  return { success: true, data: await createClient({ apiToken }).update(entity, recordId, data) };
}

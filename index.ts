import { createToolHandler, defineToolSet } from "@fastgpt-plugin/sdk-factory";
import {
  createRecord,
  getRecord,
  listRecords,
  searchRecords,
  updateRecord,
} from "./src/operations";
import {
  createRecordInputSchema,
  getRecordInputSchema,
  listOutputSchema,
  listRecordsInputSchema,
  recordOutputSchema,
  searchRecordsInputSchema,
  secretSchema,
  updateRecordInputSchema,
  type PipedriveSecrets,
} from "./src/schemas";

function requireApiToken(secrets: PipedriveSecrets | undefined): PipedriveSecrets {
  if (!secrets?.apiToken?.trim()) throw new Error("Pipedrive apiToken secret is required");
  return secrets;
}

const listRecordsHandler = createToolHandler({
  inputSchema: listRecordsInputSchema,
  outputSchema: listOutputSchema,
  secretSchema,
  handler: async (input, ctx) => listRecords({ ...input, ...requireApiToken(ctx.secrets) }),
});

const searchRecordsHandler = createToolHandler({
  inputSchema: searchRecordsInputSchema,
  outputSchema: listOutputSchema,
  secretSchema,
  handler: async (input, ctx) => searchRecords({ ...input, ...requireApiToken(ctx.secrets) }),
});

const getRecordHandler = createToolHandler({
  inputSchema: getRecordInputSchema,
  outputSchema: recordOutputSchema,
  secretSchema,
  handler: async (input, ctx) => getRecord({ ...input, ...requireApiToken(ctx.secrets) }),
});

const createRecordHandler = createToolHandler({
  inputSchema: createRecordInputSchema,
  outputSchema: recordOutputSchema,
  secretSchema,
  handler: async (input, ctx) => createRecord({ ...input, ...requireApiToken(ctx.secrets) }),
});

const updateRecordHandler = createToolHandler({
  inputSchema: updateRecordInputSchema,
  outputSchema: recordOutputSchema,
  secretSchema,
  handler: async (input, ctx) => updateRecord({ ...input, ...requireApiToken(ctx.secrets) }),
});

export default defineToolSet({
  manifest: {
    pluginId: "pipedrive",
    name: { en: "Pipedrive", "zh-CN": "Pipedrive" },
    description: {
      en: "Manage Pipedrive contacts, organizations, deals, and leads.",
      "zh-CN": "管理 Pipedrive 联系人、组织、交易和线索。",
    },
    version: "0.1.0",
    versionDescription: {
      en: "Initial Pipedrive CRM tool-suite.",
      "zh-CN": "初始 Pipedrive CRM 工具集。",
    },
    toolDescription: "Use a Pipedrive API token to list, search, read, create, and update CRM records.",
    tutorialUrl: "https://developers.pipedrive.com/docs/api/v1",
    tags: ["tools", "productivity"],
    permission: [],
  },
  secretSchema,
  children: [
    {
      id: "listRecords",
      name: { en: "List Records", "zh-CN": "查询记录" },
      description: { en: "List Pipedrive CRM records.", "zh-CN": "查询 Pipedrive CRM 记录。" },
      toolDescription: "List persons (contacts), organizations, deals, or leads with filters and pagination.",
      handler: listRecordsHandler,
    },
    {
      id: "searchRecords",
      name: { en: "Search Records", "zh-CN": "搜索记录" },
      description: { en: "Search Pipedrive CRM records.", "zh-CN": "搜索 Pipedrive CRM 记录。" },
      toolDescription: "Search persons, organizations, deals, or leads by text.",
      handler: searchRecordsHandler,
    },
    {
      id: "getRecord",
      name: { en: "Get Record", "zh-CN": "读取记录" },
      description: { en: "Read one Pipedrive CRM record.", "zh-CN": "读取一条 Pipedrive CRM 记录。" },
      toolDescription: "Read one person, organization, deal, or lead by ID.",
      handler: getRecordHandler,
    },
    {
      id: "createRecord",
      name: { en: "Create Record", "zh-CN": "创建记录" },
      description: { en: "Create a Pipedrive CRM record.", "zh-CN": "创建一条 Pipedrive CRM 记录。" },
      toolDescription: "Create a person, organization, deal, or lead with the fields accepted by Pipedrive.",
      handler: createRecordHandler,
    },
    {
      id: "updateRecord",
      name: { en: "Update Record", "zh-CN": "更新记录" },
      description: { en: "Update a Pipedrive CRM record.", "zh-CN": "更新一条 Pipedrive CRM 记录。" },
      toolDescription: "Update a person, organization, deal, or lead by ID.",
      handler: updateRecordHandler,
    },
  ],
});

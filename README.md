# Pipedrive FastGPT Plugin

Pipedrive CRM tool-suite for FastGPT. It provides a small, predictable surface for listing, searching, reading, creating, and updating contacts (persons), organizations, deals, and leads through the Pipedrive API v1.

## Tools

- `listRecords` — list records for `persons`, `organizations`, `deals`, or `leads`, with supported filters and pagination.
- `searchRecords` — search one of those record types by a term.
- `getRecord` — read one record by ID.
- `createRecord` — create a record from a JSON property map.
- `updateRecord` — update a record by ID from a JSON property map.

The API resource name `persons` is used for Pipedrive contacts.

## Secret

| Secret | Description |
| --- | --- |
| `apiToken` | Pipedrive personal API token. Create one in Pipedrive Settings → Personal preferences → API. |

The token is sent only to the fixed `https://api.pipedrive.com/v1` endpoint as Pipedrive's `api_token` request parameter. It is never included in tool output or source code.

Use the least-privileged Pipedrive account possible. This plugin does not support endpoint overrides, arbitrary paths, or shell execution.

## Local verification

```bash
pnpm install
pnpm run type-check
pnpm test
pnpm run build
pnpm run check
pnpm run pack
```

Tests mock `fetch`, covering request construction, response parsing, API-level errors, and HTTP errors. No live Pipedrive credential integration test is run.

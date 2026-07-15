import { describe, expect, it } from "vitest";
import toolSet from "./index";

describe("Pipedrive manifest", () => {
  it("declares the expected tool-set and fixed resource tools", () => {
    const manifest = toolSet.getUserToolManifest();
    expect(manifest.pluginId).toBe("pipedrive");
    expect(manifest.version).toBe("0.1.0");
    expect(toolSet.getChildManifests().map((child) => child.id)).toEqual([
      "listRecords",
      "searchRecords",
      "getRecord",
      "createRecord",
      "updateRecord",
    ]);
  });
});

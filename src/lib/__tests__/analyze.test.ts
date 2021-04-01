import { analyzeThreat } from "../analyze";

import * as SHA from "../integrations/sha";
import * as SANDBOX from "../integrations/sand-boxing";
import { INTEGRATION_TYPE } from "../integrations/types";
import { IntegrationError } from "../error";

describe("analyzeThreat", () => {
  test("should call SHA analyze", async () => {
    SHA.analyze = jest.fn().mockResolvedValueOnce({});

    await analyzeThreat(INTEGRATION_TYPE.SHA, "url", {
      filename: "filename",
      sha: "sha",
    });

    expect(SHA.analyze).toBeCalledWith("url", {
      fileName: "filename",
      sha: "sha",
    });
  });

  test("should call SANDBOX analyze", async () => {
    SANDBOX.analyze = jest.fn().mockResolvedValueOnce({});

    await analyzeThreat(INTEGRATION_TYPE.SANDBOX, "url", {
      content: "content",
      error: new Error("errr"),
    });

    expect(SANDBOX.analyze).toBeCalledWith("url", {
      content: "content",
      error: new Error("errr"),
    });
  });

  test("should error on unknown type", async () => {
    const res = analyzeThreat(INTEGRATION_TYPE.UNKNOWN, "url", {
      content: "content",
      error: new Error("errr"),
    });

    expect(res).toEqual(
      new IntegrationError(
        "Invalid Integration Type",
        INTEGRATION_TYPE.UNKNOWN,
        "url"
      )
    );
  });
});

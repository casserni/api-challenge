import { analyze } from "../analyze.controller";

import * as analyzeUtil from "../../../lib/analyze";
import * as fileUtil from "../../../lib/file";
import * as IntegrationsUtil from "../../../lib/integrations";
import {
  INTEGRATION_TYPE,
  RISK_LEVEL,
  THREAT_TYPE,
} from "../../../lib/integrations/types";
import { IntegrationError } from "../../../lib/error";

jest.mock("../../../lib/analyze");
jest.mock("../../../lib/file");
jest.mock("../../../lib/integrations");

let resSet = jest.fn();
let resStatus = jest.fn();
let resJson = jest.fn();

function mockRes() {
  const res = {
    set: resSet,
    status: resStatus,
    json: resJson,
  };
  resJson.mockImplementation(() => res);
  resStatus.mockImplementation(() => res);
  resSet.mockImplementation(() => res);

  return res;
}

describe("analyze.controller", () => {
  test("should fetch file content if integrations includes sandbox", async () => {
    IntegrationsUtil.Integrations = [
      {
        url: "http://api.integrator.com/sandbox",
        type: INTEGRATION_TYPE.SANDBOX,
      },
    ];

    await analyze({ body: { filename: "filename" } }, mockRes(), {});

    expect(fileUtil.fetchFileContent).toBeCalledWith("filename");
  });

  test("should not fetch file content if integrations does not include sandbox", async () => {
    IntegrationsUtil.Integrations = [
      {
        url: "http://api.integrator.com/sha",
        type: INTEGRATION_TYPE.SHA,
      },
    ];

    await analyze({ body: { filename: "filename" } }, mockRes(), {});

    expect(fileUtil.fetchFileContent).toHaveBeenCalledTimes(0);
  });

  test("should analyze threat for each integration", async () => {
    IntegrationsUtil.Integrations = [
      {
        url: "http://api.integrator.com/sha",
        type: INTEGRATION_TYPE.SHA,
      },
      {
        url: "http://api.integrator.com/sha2",
        type: INTEGRATION_TYPE.SHA,
      },
    ];

    await analyze(
      {
        body: {
          filename: "filename",
          sha1: "sha",
          content: "https://content.url",
        },
      },
      mockRes(),
      {}
    );

    expect(analyzeUtil.analyzeThreat).toHaveBeenCalledTimes(2);
    expect(analyzeUtil.analyzeThreat).toHaveBeenNthCalledWith(
      1,
      INTEGRATION_TYPE.SHA,
      "http://api.integrator.com/sha",
      {
        content: undefined,
        error: undefined,
        filename: "filename",
        sha: "sha",
      }
    );

    expect(analyzeUtil.analyzeThreat).toHaveBeenNthCalledWith(
      2,
      INTEGRATION_TYPE.SHA,
      "http://api.integrator.com/sha2",
      {
        content: undefined,
        error: undefined,
        filename: "filename",
        sha: "sha",
      }
    );
  });

  test("should filter threats into data and errors", async () => {
    IntegrationsUtil.Integrations = [
      {
        url: "http://api.integrator.com/sha",
        type: INTEGRATION_TYPE.SHA,
      },
      {
        url: "http://api.integrator.com/sha2",
        type: INTEGRATION_TYPE.SHA,
      },
    ];

    analyzeUtil.analyzeThreat = jest
      .fn()
      .mockResolvedValueOnce(
        new IntegrationError(
          "ERRR",
          IntegrationsUtil.Integrations[0].type,
          IntegrationsUtil.Integrations[0].url
        )
      )
      .mockResolvedValueOnce({
        type: THREAT_TYPE.MALWARE,
        threat: RISK_LEVEL.HIGH,
        integration: IntegrationsUtil.Integrations[1].type,
        url: IntegrationsUtil.Integrations[1].url,
      });

    await analyze(
      {
        body: {
          filename: "filename",
          sha1: "sha",
          content: "https://content.url",
        },
      },
      mockRes(),
      {}
    );

    expect(resStatus).toHaveBeenCalledWith(200);
    expect(resJson).toHaveBeenCalledWith({
      data: [
        {
          type: THREAT_TYPE.MALWARE,
          threat: RISK_LEVEL.HIGH,
          integration: IntegrationsUtil.Integrations[1].type,
          url: IntegrationsUtil.Integrations[1].url,
        },
      ],
      errors: [
        {
          message: "ERRR",
          integration: IntegrationsUtil.Integrations[0].type,
          url: IntegrationsUtil.Integrations[0].url,
        },
      ],
    });
  });
});

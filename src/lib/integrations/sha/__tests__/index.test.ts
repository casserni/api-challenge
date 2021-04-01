import axios from "axios";

import { IntegrationError } from "../../../error";
import { INTEGRATION_TYPE } from "../../types";
import { analyze } from "../index";

describe("analyze", () => {
  test("should error if no fileName", () => {
    expect(analyze("url", { sha: "sha" })).resolves.toEqual(
      new IntegrationError("Missing Parameters", INTEGRATION_TYPE.SHA, "url")
    );
  });

  test("should error if no sha", () => {
    expect(analyze("url", { fileName: "fileName" })).resolves.toEqual(
      new IntegrationError("Missing Parameters", INTEGRATION_TYPE.SHA, "url")
    );
  });

  test("should send axios post with params", async () => {
    axios.post = jest.fn().mockImplementationOnce(() => Promise.resolve());

    await analyze("url", {
      fileName: "fileName",
      sha: "sha",
    });

    expect(axios.post).toHaveBeenCalledWith("url", {
      fileName: "fileName",
      sha: "sha",
    });
  });

  test("should return axios post sucess", async () => {
    const data = {
      tt: "virus",
      r: "HIGH",
    };
    axios.post = jest.fn().mockResolvedValueOnce({ data });

    const res = await analyze("url", {
      fileName: "fileName",
      sha: "sha",
    });

    expect(res).toEqual({
      url: "url",
      integration: INTEGRATION_TYPE.SHA,
      type: data.tt,
      threat: data.r,
    });
  });

  test("should propagate axios post error", async () => {
    axios.post = jest.fn().mockRejectedValueOnce(new Error("errr"));

    const res = await analyze("url", {
      fileName: "fileName",
      sha: "sha",
    });

    expect(res).toEqual(
      new IntegrationError("errr", INTEGRATION_TYPE.SHA, "url")
    );
  });
});

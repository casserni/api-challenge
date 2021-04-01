import axios from "axios";

import { IntegrationError } from "../../../error";
import { INTEGRATION_TYPE } from "../../types";
import { analyze } from "../index";

describe("analyze", () => {
  test("should error if no content", () => {
    expect(analyze("url", {})).resolves.toEqual(
      new IntegrationError(
        "Missing File Content",
        INTEGRATION_TYPE.SANDBOX,
        "url"
      )
    );
  });

  test("should propagate error to Integration Error", () => {
    expect(analyze("url", { error: new Error("errr") })).resolves.toEqual(
      new IntegrationError("errr", INTEGRATION_TYPE.SANDBOX, "url")
    );
  });

  test("should send axios post with params", async () => {
    axios.post = jest.fn().mockImplementationOnce(() => Promise.resolve());

    await analyze("url", { content: "content" });

    expect(axios.post).toHaveBeenCalledWith("url", "content");
  });

  test("should return axios post sucess", async () => {
    const data = {
      ["threat-type"]: "virus",
      risk: "HIGH",
    };
    axios.post = jest.fn().mockResolvedValueOnce({ data });

    const res = await analyze("url", { content: "content" });

    expect(res).toEqual({
      url: "url",
      integration: INTEGRATION_TYPE.SANDBOX,
      type: data["threat-type"],
      threat: data.risk,
    });
  });

  test("should propagate axios post error", async () => {
    axios.post = jest.fn().mockRejectedValueOnce(new Error("errr"));

    const res = await analyze("url", { content: "content" });

    expect(res).toEqual(
      new IntegrationError("errr", INTEGRATION_TYPE.SANDBOX, "url")
    );
  });
});

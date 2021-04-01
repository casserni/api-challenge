import axios from "axios";
import { IntegrationError } from "../../error";
import {
  RISK_LEVEL,
  THREAT_TYPE,
  AnalyzeThreat,
  INTEGRATION_TYPE,
} from "../types";

export type Request = {
  content?: string;
  error?: Error;
};

export type Response = {
  risk: RISK_LEVEL;
  "threat-type": THREAT_TYPE;
};

export const analyze: AnalyzeThreat<Request> = async (url, args) => {
  if (args.content && !args.error) {
    return axios
      .post<Response>(url, args.content)
      .then((res) => ({
        url,
        integration: INTEGRATION_TYPE.SANDBOX,
        type: res.data["threat-type"],
        threat: res.data.risk,
      }))
      .catch(
        (e) => new IntegrationError(e.message, INTEGRATION_TYPE.SANDBOX, url)
      );
  }

  return new IntegrationError(
    args.error?.message || "Missing File Content",
    INTEGRATION_TYPE.SANDBOX,
    url
  );
};

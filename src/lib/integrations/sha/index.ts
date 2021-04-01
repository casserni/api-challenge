import axios from "axios";
import { IntegrationError } from "../../error";
import {
  RISK_LEVEL,
  THREAT_TYPE,
  AnalyzeThreat,
  INTEGRATION_TYPE,
} from "../types";

export type Request = {
  fileName?: string;
  sha?: string;
};

export type Response = {
  r: RISK_LEVEL;
  tt: THREAT_TYPE;
};

export const analyze: AnalyzeThreat<Request> = async (url, args) => {
  if (args.fileName && args.sha) {
    return axios
      .post<Response>(url, args)
      .then((res) => ({
        url,
        integration: INTEGRATION_TYPE.SHA,
        type: res.data.tt,
        threat: res.data.r,
      }))
      .catch((e) => new IntegrationError(e.message, INTEGRATION_TYPE.SHA, url));
  }

  return new IntegrationError("Missing Parameters", INTEGRATION_TYPE.SHA, url);
};

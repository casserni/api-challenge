import { RequestHandler } from "express";

import { analyzeThreat } from "../../lib/analyze";
import { fetchFileContent } from "../../lib/file";
import { Integrations } from "../../lib/integrations";
import {
  INTEGRATION_TYPE,
  RISK_LEVEL,
  THREAT_TYPE,
} from "../../lib/integrations/types";

type Payload = {
  filename?: string;
  sha1?: string;
  content?: string;
};

type Response = {
  data: Array<{
    type: THREAT_TYPE;
    threat: RISK_LEVEL;
    integration: INTEGRATION_TYPE;
    url: string;
  }>;
  errors: Array<{
    message: string;
    integration?: INTEGRATION_TYPE;
    url?: string;
  }>;
};

/*
 * Analyze Payload for threats against all integrations
 */

export const analyze: RequestHandler<null, Response, Payload> = async (
  req,
  res
) => {
  // if any of our integrations are sand-box fetch the file content just once

  let content: string | Error;

  if (Integrations.find((i) => i.type === INTEGRATION_TYPE.SANDBOX)) {
    content = await fetchFileContent(req.body.filename);
  }

  // analyze the payload using each integration registered with us

  const resolved = await Promise.all(
    Integrations.map((integration) => {
      return analyzeThreat(integration.type, integration.url, {
        filename: req.body.filename,
        sha: req.body.sha1,
        content: typeof content === "string" ? content : undefined,
        error: content instanceof Error ? content : undefined,
      });
    })
  );

  // Organize analyzed threats into errors or responses

  const data: Response["data"] = [];
  const errors: Response["errors"] = [];

  for (const result of resolved) {
    if (result instanceof Error) {
      errors.push({
        message: result.message,
        integration: result.meta?.type,
        url: result.meta?.url,
      });
    } else {
      data.push(result);
    }
  }

  // always return 200

  return res.status(200).json({ data, errors });
};

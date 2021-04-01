import * as SHA from "./integrations/sha";
import * as SANDBOX from "./integrations/sand-boxing";
import { INTEGRATION_TYPE } from "./integrations/types";
import { IntegrationError } from "./error";

/**
 * Analyze Threat
 */

export function analyzeThreat(
  type: INTEGRATION_TYPE,
  url: string,
  args: { filename?: string; sha?: string; content?: string; error?: Error }
) {
  switch (type) {
    case INTEGRATION_TYPE.SHA:
      return SHA.analyze(url, { fileName: args.filename, sha: args.sha });

    case INTEGRATION_TYPE.SANDBOX:
      return SANDBOX.analyze(url, { content: args.content, error: args.error });

    default:
      return new IntegrationError(
        "Invalid Integration Type",
        INTEGRATION_TYPE.UNKNOWN,
        url
      );
  }
}

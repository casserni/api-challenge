import { INTEGRATION_TYPE } from "./integrations/types";

export class IntegrationError extends Error {
  meta: { type?: INTEGRATION_TYPE; url?: string } = {};

  constructor(message: string, type: INTEGRATION_TYPE, url: string) {
    super(message);
    this.name = "IntegrationError";
    this.meta = { type, url };
  }
}

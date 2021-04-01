import { Integration, INTEGRATION_TYPE } from "./types";

/**
 * Mock Integrations
 */

export const Integrations: Integration[] = [
  {
    url: "http://api.integrator.com/sandbox",
    type: INTEGRATION_TYPE.SANDBOX,
  },
  {
    url: "http://api.integrator2.com/upload",
    type: INTEGRATION_TYPE.SANDBOX,
  },
  {
    url: "http://api.integrator3.com/lookup",
    type: INTEGRATION_TYPE.SHA,
  },
  {
    url: "http://api.integrator4.com/check",
    type: INTEGRATION_TYPE.SHA,
  },
];

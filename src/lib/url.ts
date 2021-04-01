export function isAbsolute(str: string) {
  return new RegExp(/^https?:\/\//, "i").test(str);
}

export function isFileProtocol(str: string) {
  return new RegExp(/^file:\/\//, "i").test(str);
}

const Response = {
  data: [
    {
      type: THREAT_TYPE,
      threat: RISK_LEVEL,
      integration: INTEGRATION_TYPE,
      url: "http://api.integrator3.com/lookup",
    },
  ],
  errors: [],
};

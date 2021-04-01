import { IntegrationError } from "../error";

export type Integration = {
  url: string;
  type: INTEGRATION_TYPE;
};

export enum INTEGRATION_TYPE {
  SHA = "sha",
  SANDBOX = "sandbox",
  UNKNOWN = "unknown",
}

export enum THREAT_TYPE {
  MALWARE = "malware",
  RANSOMWARE = "ransomware",
  VIRUS = "virus",
}

export enum RISK_LEVEL {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export type AnalyzeThreat<T> = (
  url: string,
  args: T
) => Promise<AnalyzedThreat | IntegrationError>;

export type AnalyzedThreat = {
  type: THREAT_TYPE;
  threat: RISK_LEVEL;
  url: string;
  integration: INTEGRATION_TYPE;
};

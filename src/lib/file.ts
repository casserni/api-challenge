import axios from "axios";
import { readFileSync } from "fs";

import { isAbsolute, isFileProtocol } from "./url";

export async function fetchFileContent(
  url: string = ""
): Promise<string | Error> {
  if (isAbsolute(url)) {
    return axios
      .get(url)
      .then((res) => res.data)
      .catch((e) => new Error(e.message || "Failed fetching file content"));
  }

  if (isFileProtocol(url)) {
    try {
      return readFileSync(url, "utf8");
    } catch (err) {
      return new Error(err.message || "Failed reading file from file system");
    }
  }

  return new Error("Invalid File Path");
}

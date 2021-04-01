import axios from "axios";
import fs from "fs";

import { fetchFileContent } from "../file";

describe("fetchFileContent", () => {
  test("should call axios on absolute url", async () => {
    axios.get = jest.fn().mockImplementationOnce(() => Promise.resolve());

    await fetchFileContent("https://foobar.com");

    expect(axios.get).toBeCalledWith("https://foobar.com");
  });

  test("should call read fileSync on file proto", async () => {
    fs.readFileSync = jest.fn();

    await fetchFileContent("file://foobar");

    expect(fs.readFileSync).toBeCalledWith("file://foobar", "utf8");
  });

  test("should error on invalid path", async () => {
    const res = await fetchFileContent("url");
    expect(res).toEqual(new Error("Invalid File Path"));
  });
});

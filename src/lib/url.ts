export function isAbsolute(str: string) {
  return new RegExp(/^https?:\/\//, "i").test(str);
}

export function isFileProtocol(str: string) {
  return new RegExp(/^file:\/\//, "i").test(str);
}

export function isValidHttpUrl(str: string) {
  let url;

  try {
    url = new URL(str);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

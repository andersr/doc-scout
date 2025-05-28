// src: https://stackoverflow.com/a/43467144/2008639
export function isValidUrl(str: string) {
  let url;

  try {
    url = new URL(str);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

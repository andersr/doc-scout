export function splitCsvText(str: string) {
  return str
    .split(/[,\n]/)
    .map((url) => url.trim())
    .filter((url) => url.length > 0);
}

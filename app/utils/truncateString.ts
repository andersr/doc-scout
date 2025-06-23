const DFLT_MAX_ALLOWED_CHARS = 50;

export function truncateString(str: string, max = DFLT_MAX_ALLOWED_CHARS) {
  return str.length <= max ? str : `${str.substring(0, max)}...`;
}

export function truncateStringNoEllipsis(
  str: string,
  max = DFLT_MAX_ALLOWED_CHARS,
) {
  return str.length <= max ? str : `${str.substring(0, max)}`;
}

export function getInitialsFromString(str: string) {
  const parts = str.split(" ");
  return parts.length > 1
    ? `${parts[0].replace(/\W/g, "").charAt(0)}${parts[parts.length - 1]
        .replace(/\W/g, "")
        .charAt(0)}`
    : parts[0].charAt(0);
}

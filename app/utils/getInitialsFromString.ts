// TODO: better handling of getting initials from email - current approach is a hack

export function getInitialsFromString(str: string) {
  const isEmail = str.includes("@"); // TODO: use actual email regex
  let parts = str.split(" ");

  if (isEmail) {
    const emailHandle = str.split("@")[0];

    parts = emailHandle.split("");
  }
  return parts.length > 1
    ? `${parts[0].replace(/\W/g, "").charAt(0)}${parts[parts.length - 1]
        .replace(/\W/g, "")
        .charAt(0)}`
    : parts[0].charAt(0);
}

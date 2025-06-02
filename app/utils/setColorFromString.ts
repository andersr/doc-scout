import { ICON_COLORS } from "~/config/theme";

export function selectColorFromString(str: string) {
  let sum = 0;
  for (let index = 0; index < str.length; index++) {
    sum += str.charCodeAt(index);
  }

  const colorIndex = sum % ICON_COLORS.length;

  return ICON_COLORS[colorIndex];
}

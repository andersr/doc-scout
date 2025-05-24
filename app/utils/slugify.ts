import slugifyModule from "slugify";

export const slugify = (
  str: string,
  options: { lower?: boolean; replacement?: "_" | "-" } = {
    lower: true,
    replacement: "-",
  },
) =>
  slugifyModule(str, {
    ...options,
    strict: true,
    trim: true,
  });

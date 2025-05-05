import slugifyModule from "slugify";

export const slugify = (
  str: string,
  options: { lower?: boolean; replacement?: "_" | "-" } = {
    lower: true,
    replacement: "-",
  }
) =>
  slugifyModule(str, {
    lower: options.lower,
    strict: true,
    trim: true,
  });

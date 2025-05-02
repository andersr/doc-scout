import slugifyPkg from "slugify";

export const slugify = (
  str: string,
  options: { lower?: boolean; replacement?: "_" | "-" } = {
    lower: true,
    replacement: "-",
  }
) =>
  slugifyPkg(str, {
    lower: options.lower,
    strict: true,
    trim: true,
  });

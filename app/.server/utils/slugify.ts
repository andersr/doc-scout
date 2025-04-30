import slugifyPkg from "slugify";

export const slugify = (
  str: string,
  options: { lower?: boolean } = { lower: true }
) =>
  slugifyPkg(str, {
    lower: options.lower,
    strict: true,
    trim: true,
  });

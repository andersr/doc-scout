// src: /typescript/lib/lib.es5.d.ts
interface DateTimeFormatOptions {
  day?: "numeric" | "2-digit" | undefined;
  era?: "long" | "short" | "narrow" | undefined;
  formatMatcher?: "best fit" | "basic" | undefined;
  hour?: "numeric" | "2-digit" | undefined;
  hour12?: boolean | undefined;
  localeMatcher?: "best fit" | "lookup" | undefined;
  minute?: "numeric" | "2-digit" | undefined;
  month?: "numeric" | "2-digit" | "long" | "short" | "narrow" | undefined;
  second?: "numeric" | "2-digit" | undefined;
  timeZone?: string | undefined;
  timeZoneName?:
    | "short"
    | "long"
    | "shortOffset"
    | "longOffset"
    | "shortGeneric"
    | "longGeneric"
    | undefined;
  weekday?: "long" | "short" | "narrow" | undefined;
  year?: "numeric" | "2-digit" | undefined;
}

interface Args {
  d: Date;
  withDay?: boolean;
  withTime?: boolean;
}

export function formatDateTime({ d, withDay, withTime }: Args) {
  const currentYear = new Date().getFullYear();
  const dateYear = d.getFullYear();
  const options: DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  };

  if (dateYear === currentYear && withDay) {
    options.weekday = "short";
  }

  if (withTime) {
    options.hour = "numeric";
    options.minute = "numeric";
  }

  return d.toLocaleDateString("en-us", options);
}

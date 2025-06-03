import { twMerge } from "tailwind-merge";
import { getInitialsFromString } from "~/utils/getInitialsFromString";

interface Props {
  email: string;
  imageUrl?: string | null;
  name?: string | null;
}

export function Avatar({ email, imageUrl, name }: Props) {
  const userNameOrEmail = name || email;
  const initials = getInitialsFromString(userNameOrEmail);
  const textSize = initials.length > 1 ? "text-xl" : "text-xl md:text-2xl";
  return imageUrl ? (
    <img
      src={imageUrl}
      className={twMerge("rounded-full", textSize)}
      alt={userNameOrEmail}
      title={userNameOrEmail}
    />
  ) : (
    <div
      className={twMerge(
        "flex items-center justify-center rounded-full px-1 pt-0.5 pb-1 leading-none uppercase",
        "bg-stone-300 text-stone-600",

        "size-10",
        textSize,
      )}
      aria-label={userNameOrEmail}
      title={userNameOrEmail}
    >
      {initials}
    </div>
  );
}

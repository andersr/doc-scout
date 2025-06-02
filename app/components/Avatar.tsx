import { twMerge } from "tailwind-merge";
import { getInitialsFromString } from "~/utils/getInitialsFromString";

interface Props {
  email: string;
  imageUrl?: string | null;
  name?: string | null;
  size?: string;
}

const DEFAULT_AVATAR_SIZE = "size-10";

export function Avatar({
  email,
  imageUrl,
  name,
  size = DEFAULT_AVATAR_SIZE,
}: Props) {
  const userNameOrEmail = name || email;
  const initials = getInitialsFromString(userNameOrEmail);

  return imageUrl ? (
    <img
      src={imageUrl}
      className={twMerge("rounded-full", size)}
      alt={userNameOrEmail}
      title={userNameOrEmail}
    />
  ) : (
    <div
      className={twMerge(
        "flex items-center justify-center rounded-full p-1 leading-none uppercase",
        "bg-stone-300 text-xl text-stone-600",

        size,
      )}
      aria-label={userNameOrEmail}
      title={userNameOrEmail}
    >
      {initials}
    </div>
  );
}

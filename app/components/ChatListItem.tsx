import Markdown from "markdown-to-jsx";
import { twMerge } from "tailwind-merge";

import { BOT_NAME } from "~/config/bot";
import { formatDateTime } from "~/utils/formatDateTime";
import { DotsLoading } from "./DotsLoading";

interface ChatListItemProps {
  authorName?: string;
  createdAt?: Date;
  isBot?: boolean;
  loading?: boolean;
  text?: string;
}

export function ChatListItem({
  authorName,
  createdAt,
  isBot,
  loading,
  text,
}: ChatListItemProps) {
  return (
    <li
      className={twMerge(
        "flex w-full flex-col gap-1 whitespace-pre-line",
        isBot ? "items-end" : "items-start",
      )}
    >
      <div
        className={twMerge(
          "max-w-80 rounded-t-lg px-3 py-2 text-base leading-6 md:max-w-xl",
          isBot ? "rounded-bl-lg bg-amber-50" : "rounded-br-lg bg-blue-50",
        )}
      >
        {loading ? <DotsLoading /> : text ? <Markdown>{text}</Markdown> : ""}
      </div>
      {!loading && (
        <div className={twMerge("text-stone-500")}>
          {isBot ? BOT_NAME : authorName},&nbsp;
          {createdAt &&
            formatDateTime({
              d: createdAt,
              withTime: true,
            })}
        </div>
      )}
    </li>
  );
}

import Markdown from "markdown-to-jsx";
import { twMerge } from "tailwind-merge";

import { BOT_NAME } from "~/config/bot";
import { formatDateTime } from "~/utils/formatDateTime";
import { CopyButton } from "../CopyToClipboard/CopyButton";
import { useCopyToClipboard } from "../CopyToClipboard/useCopyToClipboard";
import { DotsLoading } from "../ui/progress/DotsLoading";

interface ChatListItemProps {
  createdAt?: Date;
  isBot?: boolean;
  loading?: boolean;
  text?: string;
}

export function ChatListItem(props: ChatListItemProps) {
  const { isBot, loading } = props;
  return (
    <ChatListItemContainer isBot={isBot}>
      <ChatContent {...props} />
      {!loading && <ChatInfo {...props} />}
    </ChatListItemContainer>
  );
}

function ChatContent({ isBot, loading, text }: ChatListItemProps) {
  const { didCopy, handleCopyClick } = useCopyToClipboard();
  const displayCopyToClipboard = isBot && !loading;
  return (
    <div
      className={twMerge(
        "relative max-w-80 rounded-t-lg px-3 py-2 text-base leading-6 md:max-w-xl",
        isBot
          ? "prose-sm rounded-bl-lg bg-amber-50"
          : "rounded-br-lg bg-blue-50",
      )}
    >
      {displayCopyToClipboard && text && (
        <CopyButton didCopy={didCopy} onClick={() => handleCopyClick(text)} />
      )}
      {loading ? <DotsLoading /> : text ? <Markdown>{text}</Markdown> : ""}
    </div>
  );
}

function ChatInfo({ createdAt, isBot }: ChatListItemProps) {
  return (
    <div className={twMerge("text-sm text-stone-500")}>
      {isBot ? `${BOT_NAME}, ` : ""}
      {createdAt &&
        formatDateTime({
          d: createdAt,
          withTime: true,
        })}
    </div>
  );
}

function ChatListItemContainer({
  children,
  isBot,
}: { isBot: ChatListItemProps["isBot"] } & { children: React.ReactNode }) {
  return (
    <li
      className={twMerge(
        "flex w-full flex-col gap-1 whitespace-pre-line",
        isBot ? "items-end" : "items-start",
      )}
    >
      {children}
    </li>
  );
}

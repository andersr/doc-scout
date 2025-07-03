import Markdown from "markdown-to-jsx";
import { twMerge } from "tailwind-merge";

import { BOT_NAME } from "~/config/bot";
import { formatDateTime } from "~/utils/formatDateTime";
import { CopyButton } from "../../lib/copyToClipboard/CopyButton";
import { useCopyToClipboard } from "../../lib/copyToClipboard/useCopyToClipboard";
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

function ChatContent(props: ChatListItemProps) {
  const { isBot, loading, text } = props;
  return (
    <div
      className={twMerge(
        "relative max-w-80 rounded-t-lg px-3 py-2 text-base leading-6 md:max-w-xl",
        isBot ? "rounded-bl-lg bg-amber-50" : "rounded-br-lg bg-blue-50",
      )}
    >
      {loading ? <DotsLoading /> : isBot ? <BotReply {...props} /> : text}
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

function BotReply({ text }: ChatListItemProps) {
  const { didCopy, handleCopyClick } = useCopyToClipboard();
  return text ? (
    <>
      <div className="absolute top-1 right-1 z-10">
        <CopyButton didCopy={didCopy} onClick={() => handleCopyClick(text)} />
      </div>
      <div className="prose-sm">
        <Markdown>{text}</Markdown>
      </div>
    </>
  ) : (
    ""
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

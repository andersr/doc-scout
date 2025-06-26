import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { twMerge } from "tailwind-merge";

import { ChatListItem } from "~/components/ChatListItem";
import { ListContainer } from "~/components/containers/ListContainer";
import { ScrollContainer } from "~/components/containers/ScrollContainer";
import { Icon } from "~/components/icon";
import { Spinner } from "~/components/Spinner";
import { useScrollIntoView } from "~/hooks/useScrollIntoView";
import { KEYS } from "~/shared/keys";
import { HOVER_TRANSITION } from "~/styles/animations";
import { INPUT_STYLES } from "~/styles/inputs";
import { type ClientMessage } from "~/types/message";
import type { ServerResponse } from "~/types/server";

export default function BotChat({
  hasPendingQuery,
  messages,
}: {
  hasPendingQuery: boolean;
  messages: ClientMessage[];
}) {
  const [message, setMessage] = useState("");

  const fetcher = useFetcher<ServerResponse>();

  const botResponded = !hasPendingQuery && fetcher.state === "idle";

  const listBottomRef = useScrollIntoView({
    onAnyTrue: [hasPendingQuery, botResponded],
    onLoad: true,
  });

  const optimisticMessage = fetcher.formData
    ? fetcher.formData.get(KEYS.message)
    : null;

  const submitDisabled = fetcher.state !== "idle" || message.trim() === "";

  useEffect(() => {
    if (optimisticMessage && message.trim() !== "") {
      setMessage("");
    }
  }, [optimisticMessage, message]);

  return (
    <div className="flex flex-1 flex-col">
      <ScrollContainer listBottomRef={listBottomRef}>
        {messages.length === 0 && !optimisticMessage && (
          <div className="flex size-full items-center justify-center">
            Ask a question below to get started.
          </div>
        )}
        <ListContainer>
          {messages.map((m) => (
            <ChatListItem
              key={m.publicId}
              isBot={m.isBot}
              createdAt={m.createdAt}
              text={m.text}
              authorName={m.author?.email ?? ""}
            />
          ))}
          {optimisticMessage && (
            <ChatListItem
              createdAt={new Date()}
              text={optimisticMessage.toString()}
              // authorName={clientUser.email ?? ""}
            />
          )}
          {fetcher.state !== "idle" && <ChatListItem isBot loading />}
        </ListContainer>
      </ScrollContainer>{" "}
      <div
        className={twMerge(
          "fixed right-4 bottom-4 left-4 z-10 md:mx-auto md:max-w-5xl",
          "bg-background",
        )}
      >
        {fetcher.data?.errors &&
          fetcher.data?.errors.length > 0 &&
          fetcher.data.errors.map((e) => (
            <p className="text-danger py-2" key={e}>
              {e}
            </p>
          ))}
        <fetcher.Form method="POST">
          <div className="flex w-full items-end gap-2">
            <textarea
              name={KEYS.message}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={twMerge(INPUT_STYLES, "bg-white")}
              placeholder={"Message"}
              rows={1}
            />
            <div className="flex items-center">
              <button
                type="submit"
                className={twMerge(
                  "disabled:bg-grey-2 hover:text-light-green bg-navy-blue flex cursor-pointer items-center justify-center rounded-lg p-3 text-white disabled:text-stone-100 disabled:opacity-40",
                  HOVER_TRANSITION,
                )}
                disabled={submitDisabled}
              >
                {fetcher.state !== "idle" ? (
                  <Spinner />
                ) : (
                  <Icon name={"ARROW_UP"} fontSize="24px" />
                )}
              </button>
            </div>
          </div>
        </fetcher.Form>
      </div>
    </div>
  );
}

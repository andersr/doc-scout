import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { twMerge } from "tailwind-merge";

import { ScrollContainer } from "~/components/layout/ScrollContainer";
import { Icon } from "~/components/ui/Icon";
import { Spinner } from "~/components/ui/progress/Spinner";
import { useScrollIntoView } from "~/hooks/useScrollIntoView";
import { KEYS } from "~/shared/keys";
import { HOVER_TRANSITION } from "~/styles/animations";
import { INPUT_STYLES } from "~/styles/inputs";
import { type ClientMessage } from "~/types/message";
import type { ServerResponse } from "~/types/server";
import { ListContainer } from "../ui/lists/ListContainer";
import { ChatListItem } from "./ChatListItem";

export default function BotChat({ messages }: { messages: ClientMessage[] }) {
  const [message, setMessage] = useState("");

  const fetcher = useFetcher<ServerResponse>();

  const { listBottomRef, scrollIntoView } = useScrollIntoView();

  const optimisticMessage = fetcher.formData
    ? fetcher.formData.get(KEYS.message)
    : null;

  const submitDisabled = fetcher.state !== "idle" || message.trim() === "";

  useEffect(() => {
    if (optimisticMessage && message.trim() !== "") {
      setMessage("");
    }
  }, [optimisticMessage, message]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollIntoView();
    }
  }, [fetcher.state, messages.length, scrollIntoView]);

  return (
    <>
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
            />
          ))}
          {optimisticMessage && (
            <ChatListItem
              createdAt={new Date()}
              text={optimisticMessage.toString()}
            />
          )}
          {fetcher.state !== "idle" && <ChatListItem isBot loading />}
        </ListContainer>
      </ScrollContainer>
      <div
        className={twMerge(
          "w-full md:mx-auto md:max-w-3xl",
          "fixed inset-x-0 bottom-0 z-10 bg-white px-3 md:bottom-12",
        )}
      >
        <div className="py-4 md:pt-2 md:pb-3">
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
                  name={KEYS.intent}
                  value={KEYS.chat}
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
    </>
  );
}

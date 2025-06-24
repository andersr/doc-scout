import { ServerError } from "~/types/server";
import type { SourceWithRelations } from "~/types/source";

// TODO: assumes first chat is primary chat, add explicit ref to primary source chat, eg add primary boolean to ChatSource
export function requireSourceChat({ source }: { source: SourceWithRelations }) {
  const sourceChat = source.chats.length > 0 ? source.chats[0].chat : undefined;

  if (!sourceChat) {
    throw new ServerError("No source chat found.");
  }

  return sourceChat;
}

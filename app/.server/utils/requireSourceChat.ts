import { ServerError } from "~/types/server";
import type { SourceWithRelations } from "~/types/source";

export function requireSourceChat({ source }: { source: SourceWithRelations }) {
  const sourceChat = source.chats.length > 0 ? source.chats[0].chat : undefined;

  if (!sourceChat) {
    throw new ServerError("No source chat found.");
  }

  return sourceChat;
}

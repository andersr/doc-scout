import type { Prisma } from "@prisma/client";

export const MESSAGE_INCLUDE = {
  author: true,
} as const;

export type MessageWithRelations = Prisma.MessageGetPayload<{
  include: typeof MESSAGE_INCLUDE;
}>;

// need to convert MessageType.Bot to isBot boolean due to use of Prisma enums on the client causing Vite build failure
export type ClientMessage = MessageWithRelations & { isBot: boolean };

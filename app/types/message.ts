import type { Prisma } from "@prisma/client";

type MessageWithRelations = Prisma.MessageGetPayload<{
  include: {
    author: true;
  };
}>;

// need to convert MessageType.Bot to isBot boolean due to use of Prisma enums on the client causing Vite build failure
export type ClientMessage = MessageWithRelations & { isBot: boolean };

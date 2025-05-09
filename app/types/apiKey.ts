import type { Prisma } from "@prisma/client";

export type ApiKeyWithProject = Prisma.KeyGetPayload<{
  include: {
    project: true;
  };
}>;

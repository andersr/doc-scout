import type { Prisma } from "@prisma/client";

export const PROJECT_SELECT = {
  id: true,
  publicId: true,
  name: true,
  collectionName: true,
  sources: true,
  apiKeys: {
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  },
} as const;

export type ProjectClient = Prisma.ProjectGetPayload<{
  select: {
    name: true;
    collectionName: true;
    createdAt: true;
    publicId: true;
  };
}>;

import type { Prisma } from "@prisma/client";

export const PROJECT_SELECT_INTERNAL = {
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

export const PROJECT_SELECT_CLIENT = {
  name: true,
  collectionName: true,
  createdAt: true,
  publicId: true,
  sources: {
    select: {
      publicId: true,
      name: true,
    },
  },
} as const;

export type ProjectClient = Prisma.ProjectGetPayload<{
  select: typeof PROJECT_SELECT_CLIENT;
}>;

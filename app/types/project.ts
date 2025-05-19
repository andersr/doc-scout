import type { Prisma } from "@prisma/client";

export const PROJECT_SELECT_INTERNAL = {
  apiKeys: {
    select: {
      createdAt: true,
      id: true,
      name: true,
    },
  },
  collectionName: true,
  id: true,
  name: true,
  publicId: true,
  sources: true,
} as const;

export const PROJECT_SELECT_CLIENT = {
  collectionName: true,
  createdAt: true,
  name: true,
  publicId: true,
  sources: {
    select: {
      name: true,
      publicId: true,
    },
  },
} as const;

export type ProjectClient = Prisma.ProjectGetPayload<{
  select: typeof PROJECT_SELECT_CLIENT;
}>;

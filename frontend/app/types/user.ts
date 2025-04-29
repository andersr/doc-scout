import type { User } from "@prisma-app/client";

export type UserClient = Pick<User, "email" | "publicId">;

import type { User } from "@prisma/client";

export type UserClient = Pick<User, "email" | "publicId">;

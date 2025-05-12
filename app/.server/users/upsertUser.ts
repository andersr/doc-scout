import type { User } from "@prisma/client";
import { createUser } from "./createUser";
import { getUserByEmail } from "./getUserByEmail";

// export function upsertUser({
//   email,
//   name,
// }: Pick<User, "email"> & Partial<Pick<User, "name">>) {
//   const emailNormalized = email.trim().toLowerCase();
//   const now = new Date();

//   return prisma.user.upsert({
//     create: {
//       createdAt: now,
//       email: emailNormalized,
//       name,
//       publicId: generateId(),
//     },
//     update: {
//       name,
//     },
//     where: {
//       email: {
//         equals: email,
//         mode: "insensitive",
//       },
//     },
//   });
// }

export async function upsertUser({
  email,
  name,
}: Pick<User, "email"> & Partial<Pick<User, "name">>): Promise<{
  newUser: boolean;
  user: User;
}> {
  let user = await getUserByEmail({
    email,
  });

  if (user) {
    return { user, newUser: false };
  }

  user = await createUser({ email, name });

  return { user, newUser: true };

  // return user;
  // const emailNormalized = email.trim().toLowerCase();
  // const now = new Date();

  // return prisma.user.upsert({
  //   create: {
  //     createdAt: now,
  //     email: emailNormalized,
  //     name,
  //     publicId: generateId(),
  //   },
  //   update: {
  //     name,
  //   },
  //   where: {
  //     email: {
  //       equals: email,
  //       mode: "insensitive",
  //     },
  //   },
  // });
}

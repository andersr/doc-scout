import type { Prisma, User } from "@prisma/client";

export const USER_INTERNAL_INCLUDE = {
  messages: true,
  sources: true,
} as const;

// TODO: same as in requireUser
export type UserInternal = Prisma.UserGetPayload<{
  include: typeof USER_INTERNAL_INCLUDE;
}>;

// export type UserClient = Prisma.UserGetPayload<{
//   select: {
//     email: true;
//     projectMemberships: {
//       select: {
//         project: {
//           select: {
//             name: true;
//             publicId: true;
//             sources: {
//               select: {
//                 name: true;
//                 publicId: true;
//                 url: true;
//               };
//             };
//           };
//         };
//       };
//     };
//     publicId: true;
//   };
// }>;

export type UserClient = Pick<User, "publicId">;

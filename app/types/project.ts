import type { Prisma } from "@prisma/client";

// TODO: same as in requireUser
// export type UserInternal = Prisma.UserGetPayload<{
//   include: {
//     projectMemberships: {
//       include: {
//         project: {
//           include: {
//             sources: true;
//           };
//         };
//       };
//     };
//   };
// }>;

export type ProjectClient = Prisma.ProjectGetPayload<{
  select: {
    name: true;
    collectionName: true;
    createdAt: true;
    publicId: true;
  };
}>;

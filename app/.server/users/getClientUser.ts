import { prisma } from "~/lib/prisma";
import type { DataRequest } from "~/types/dataRequest";
import { logout } from "../sessions/logout";
import { getUserPublicId } from "./getUserPublicId";
// import type { Prisma } from "@prisma-app/client";

export async function getClientUser({ request, require }: DataRequest) {
  const publicId = await getUserPublicId({ request, require });

  const user = await prisma.user.findUnique({
    where: {
      publicId: publicId ?? "",
    },
    select: {
      email: true,
      publicId: true,
      projectMemberships: {
        select: {
          project: {
            select: {
              name: true,
              publicId: true,
              sources: {
                select: {
                  name: true,
                  url: true,
                  publicId: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (require && !user) {
    throw await logout({ request });
  }

  return user;
}

// export async function requireInternalUser({ request }: { request: Request }) {
//   const publicId = await requireUserPublicId({ request });

//   const user = await prisma.user.findUnique({
//     where: {
//       publicId: publicId ?? "",
//     },
//     include: {
//       projectMemberships: {
//         include: {
//           project: {
//             include: {
//               sources: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   if (!user) {
//     throw await logout({ request });
//   }

//   return user;
// }

// export async function requireUser({
//   clientUser,
//   request,
// }: {
//   clientUser?: boolean;
//   request: Request;
// }) {
//   const publicId = await requireUserPublicId({ request });

//   const input: Prisma.UserFindFirstArgs = {
//     where: {
//       publicId: publicId ?? "",
//     },
//   };

//   // if (clientUser) {
//   //   // select only values that we want to expose to the client
//   //   input.select = {
//   //     email: true,
//   //     publicId: true,
//   //     projectMemberships: {
//   //       select: {
//   //         project: {
//   //           select: {
//   //             name: true,
//   //             publicId: true,
//   //             sources: {
//   //               select: {
//   //                 name: true,
//   //                 url: true,
//   //                 publicId: true,
//   //               },
//   //             },
//   //           },
//   //         },
//   //       },
//   //     },
//   //   };
//   // } else {
//   //   // return everything
// input.include = {
//   projectMemberships: {
//     include: {
//       project: {
//         include: {
//           sources: true,
//         },
//       },
//     },
//   },
//   };
//   // }

//   // const user = await prisma.user.findFirst(input);

//   const user = await prisma.user.findFirst({
//     where: {
//       publicId: publicId ?? "",
//     },
//     select: {
//       email: true,
//       publicId: true,
//       projectMemberships: {
//         select: {
//           project: {
//             select: {
//               name: true,
//               publicId: true,
//               sources: {
//                 select: {
//                   name: true,
//                   url: true,
//                   publicId: true,
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//   });

//   if (!user) {
//     throw await logout({ request });
//   }

//   return user;
// }

import { PrismaClient } from "../../generated/prisma";

export const prisma = new PrismaClient();

// import { PrismaClient } from "@prisma/client";

// let prisma: PrismaClient;

// declare global {
//   // eslint-disable-next-line no-var
//   var __db__: PrismaClient;
// }

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
// in production we'll have a single connection to the DB.
// if (process.env.NODE_ENV === "production") {
//   prisma = new PrismaClient();
// } else {
//   if (!global.__db__) {
//     global.__db__ = new PrismaClient();
//   }
//   prisma = global.__db__;
//   prisma.$connect();
// }

// TODO: replace above with this, from https://github.com/prisma/prisma/issues/1983#issuecomment-686742774
// class DBClient {
//   public prisma: PrismaClient
//   private static instance: DBClient
//   private constructor() {
//     this.prisma = new PrismaClient()
//   }

//   public static getInstance = () => {
//     if (!DBClient.instance) {
//       DBClient.instance = new DBClient()
//     }
//     return DBClient.instance
//   }
// }

// export { prisma };

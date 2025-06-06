import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { type ActionFunctionArgs, data } from "react-router";
import { createSession } from "~/.server/sessions/createSession";
import { stytchClient } from "~/.server/stytch/client";
import { generateId } from "~/.server/utils/generateId";
import { requireSearchParam } from "~/.server/utils/requireSearchParam";
import { STYTCH_SESSION_TOKEN } from "~/config/auth";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const email = requireSearchParam({ key: KEYS.email, request });
    const password = requireSearchParam({ key: KEYS.password, request });

    const userInput = {
      email,
      password,
    };

    const testUser = await prisma.user.findUnique({
      where: {
        username: email,
      },
    });

    if (!testUser) {
      const searchRes = await stytchClient.users.search({
        cursor: "",
        limit: 1,
        query: {
          operands: [
            {
              filter_name: "email_address",
              filter_value: [email],
            },
          ],
          operator: "AND",
        },
      });

      if (searchRes.results.length === 0) {
        const userRes = await stytchClient.passwords.create(userInput);

        await prisma.user.create({
          data: {
            publicId: generateId(),
            stytchId: userRes.user_id,
            username: email,
          },
        });
      } else {
        await prisma.user.upsert({
          create: {
            publicId: generateId(),
            stytchId: searchRes.results[0].user_id,
            username: email,
          },
          update: {},
          where: {
            username: email,
          },
        });
      }
    }

    const authRes = await stytchClient.passwords.authenticate({
      ...userInput,
      session_duration_minutes: 60,
    });

    return createSession({
      key: STYTCH_SESSION_TOKEN,
      redirectTo: appRoutes("/"),
      request,
      token: authRes.session_token,
    });
  } catch (error) {
    console.error("error: ", error);
    throw data({ error: ReasonPhrases.BAD_REQUEST }, StatusCodes.BAD_REQUEST);
  }
};

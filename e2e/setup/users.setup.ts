import { APIRequestContext, test as setup } from "@playwright/test";
import {
  getTestEmail,
  TEST_USER_PWD,
  TestUserNames,
} from "../../app/__test__/users";
import { appRoutes } from "../../app/shared/appRoutes";
import { setAuthStoragePath } from "../utils/setAuthStoragePath";
import { upsertTestUser } from "../utils/upsertTestUsers";
const port = process.env.PORT;

setup("test users setup", async ({ request }) => {
  if (!port) {
    throw new Error("No port env var found");
  }

  await authenticateTestUsers({ request, usernames: TestUserNames });
});

async function authenticateTestUsers({
  request,
  usernames,
}: {
  request: APIRequestContext;
  usernames: readonly string[];
}) {
  for await (const userName of usernames) {
    await upsertTestUser(userName);

    const storagePath = setAuthStoragePath(userName);

    const loginRoute = appRoutes("/e2e/login", {
      email: getTestEmail(userName),
      password: TEST_USER_PWD,
    });

    await request.post(`http://localhost:${port}${loginRoute}`);

    await request.storageState({ path: storagePath });
  }
}

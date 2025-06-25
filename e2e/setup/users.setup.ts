import { type APIRequestContext, test as setup } from "@playwright/test";
import { getTestEmail } from "e2e/utils/getTestEmail";
import { appRoutes } from "../../app/shared/appRoutes";
import { TestUserNames } from "../../app/types/testUsers";
import { setAuthStoragePath } from "../utils/setAuthStoragePath";
import { upsertTestUser } from "../utils/upsertTestUsers";
const port = process.env.PORT;

const testUserPwd: string = process.env.TEST_USER_PWD ?? "";

setup("test users setup", async ({ request }) => {
  if (testUserPwd === "") {
    throw new Error("No test user password");
  }

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
  usernames: readonly TestUserNames[];
}) {
  for await (const userName of usernames) {
    await upsertTestUser(userName);

    const storagePath = setAuthStoragePath(userName);

    const loginRoute = appRoutes("/e2e/login", {
      email: getTestEmail(userName),
      password: testUserPwd,
    });

    await request.post(`http://localhost:${port}${loginRoute}`);

    await request.storageState({ path: storagePath });
  }
}

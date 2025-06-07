import { test as setup } from "@playwright/test";
import { $path as appRoutes } from "safe-routes";

const port = process.env.PORT;

if (!port) {
  throw new Error("no port found");
}

const testUsers = process.env.TEST_USERS;

if (!testUsers) {
  throw new Error("no port found");
}

const user1TestAuthStorage = "playwright/.auth/user1.json";

setup("authenticate user", async ({ request }) => {
  const testUser = testUsers.split(",")[0];
  if (!testUser) {
    throw new Error("no test user found");
  }

  const emailPwd = testUser.split("|");

  if (emailPwd.length !== 2) {
    throw new Error("Invalid test credentials");
  }

  const [email, password] = emailPwd;

  const loginRoute = appRoutes("/e2e/login", {
    email,
    password,
  });

  await request.post(`http://localhost:${port}${loginRoute}`);

  await request.storageState({ path: user1TestAuthStorage });
});

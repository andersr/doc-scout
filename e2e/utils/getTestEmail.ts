const TEST_DOMAIN = "anders.co";

export const getTestEmail = (user: string) =>
  `anders+${user}${process.env.CI ? ".ci" : ""}@${TEST_DOMAIN}`;

const TEST_DOMAIN = "anders.co";

export const getTestEmail = (user: string) =>
  `${user}${process.env.CI ? "+ci" : ""}@${TEST_DOMAIN}`;

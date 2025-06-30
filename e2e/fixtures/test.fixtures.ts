import { test as base } from "@playwright/test";
import { MockFileFactory } from "./MockFile";

type MyFixtures = {
  fileFactory: MockFileFactory;
};

export const test = base.extend<MyFixtures>({
  fileFactory: async ({ page }, use) => {
    const fileFactory = new MockFileFactory(page);
    await use(fileFactory);
  },
});
export { expect } from "@playwright/test";

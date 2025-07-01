import { test as base } from "@playwright/test";
import { ApiRequest } from "./fixtures/ApiRequest";
import { MockFileFactory } from "./fixtures/MockFileFactory";

type MyFixtures = {
  apiRequest: ApiRequest;
  fileFactory: MockFileFactory;
};

export const test = base.extend<MyFixtures>({
  apiRequest: async ({ request }, use) => {
    const apiRequest = new ApiRequest(request);
    await use(apiRequest);
  },
  fileFactory: async ({ page, request }, use) => {
    const fileFactory = new MockFileFactory(page, request);
    await use(fileFactory);
  },
});
export { expect } from "@playwright/test";

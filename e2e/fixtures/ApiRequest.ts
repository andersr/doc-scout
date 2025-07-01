import type { APIRequestContext } from "@playwright/test";
import { appRoutes } from "~/shared/appRoutes";
import { TEST_KEYS } from "~/shared/testKeys";

export class ApiRequest {
  constructor(public readonly request: APIRequestContext) {}

  async deleteDocsByName(names: string[]) {
    const sourceNames = names.join(",");

    await this.request.post(
      appRoutes("/e2e/:command", {
        command: TEST_KEYS.deleteSourcesByName,
      }),
      {
        form: {
          sourceNames,
        },
      },
    );
  }
}

import type { APIRequestContext, Page } from "@playwright/test";
import { MOCK_SOURCE } from "e2e/mocks/sources/mockSource";
import { appRoutes } from "~/shared/appRoutes";
import { TEST_KEYS } from "~/shared/testKeys";

// TODO: create base class and extend for Docs, etc
export class ApiRequest {
  constructor(
    public readonly page: Page,
    public readonly request: APIRequestContext,
  ) {}

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

  async mockStorageRoute(fileNames: string[]) {
    await this.page.route(
      `https://*.s3.*.amazonaws.com/users/**/*`,
      async (route) => {
        const json = {
          filesInfo: fileNames.map((f) => this.getFileInfo(f)),
        };
        await route.fulfill({ json });
      },
    );
  }

  private getFileInfo(fileName: string) {
    return {
      fileName,
      signedUrl: "https://foo",
      sourcePublicId: MOCK_SOURCE.publicId,
      storagePath: MOCK_SOURCE.storagePath,
    };
  }
}

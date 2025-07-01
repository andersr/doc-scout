/* eslint-disable @typescript-eslint/no-unused-vars */

import { MOCK_SCRAPE_RESULT } from "e2e/mocks/scrapes/mockScrapeResult";

export async function batchScrapeUrls({ urls }: { urls: string[] }) {
  return [MOCK_SCRAPE_RESULT];
}

import { StatusCodes } from "http-status-codes";
import { ServerError } from "~/types/server";
import { fcApp } from "../vendors/firecrawl/fcApp";

export async function batchScrapeUrls({ urls }: { urls: string[] }) {
  const res = await fcApp.batchScrapeUrls(urls, {
    formats: ["markdown"],
  });

  if (!res.success) {
    throw new ServerError(
      `Failed to get url data: ${res.error}`,
      StatusCodes.BAD_GATEWAY,
    );
  }

  return res.data;
}

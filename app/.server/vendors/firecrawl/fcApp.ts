import FirecrawlApp from "@mendable/firecrawl-js";
import { ENV } from "~/.server/ENV";

export const fcApp = new FirecrawlApp({ apiKey: ENV.FIRECRAWL_API_KEY });

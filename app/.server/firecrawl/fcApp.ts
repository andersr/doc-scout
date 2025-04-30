import FirecrawlApp from "@mendable/firecrawl-js";
import { ENV } from "../ENV";

export const fcApp = new FirecrawlApp({ apiKey: ENV.FIRECRAWL_API_KEY });

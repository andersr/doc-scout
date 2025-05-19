export interface DocPage {
  content: string;
  title: string;
  url: string;
}

// https://docs.firecrawl.dev/api-reference/endpoint/scrape
// interface ScrapeResponse {
//   success: true;
//   data: {
//     markdown: string;
//     html: string;
//   };
//   metadata: {
//     title: string;
//   };
//   error: string;
// }
// interface ErrorResponse {
//   success: false;
//   error: string;
// }

export interface ScrapeData {
  html: string;
  markdown: string;
  metadata: {
    title: string;
  };
}

// full metadata sample
// "metadata": {
//   "language": "en",
//   "favicon": "https://www.anders.co/favicon.ico",
//   "theme-color": "#ffffff",
//   "twitter:card": "summary_large_image",
//   "og:url": "https://www.anders.co/blog/an-ai-assistant-development-lifecycle/",
//   "title": "An AI Assistant Development Lifecycle | Anders Ramsay - Designing and Building Digital Products",
//   "description": "How to implement and administer AI Assistants locally.",
//   "ogDescription": "How to implement and administer AI Assistants locally.",
//   "generator": "Astro v5.2.5",
//   "ogUrl": "https://www.anders.co/blog/an-ai-assistant-development-lifecycle/",
//   "msapplication-TileColor": "#da532c",
//   "og:site_name": "Ander Ramsay's Personal Site",
//   "og:type": "website",
//   "ogSiteName": "Ander Ramsay's Personal Site",
//   "ogTitle": "An AI Assistant Development Lifecycle | Anders Ramsay - Designing and Building Digital Products",
//   "twitter:url": "https://www.anders.co/blog/an-ai-assistant-development-lifecycle/",
//   "twitter:title": "An AI Assistant Development Lifecycle | Anders Ramsay - Designing and Building Digital Products",
//   "viewport": "width=device-width,initial-scale=1",
//   "twitter:description": "How to implement and administer AI Assistants locally.",
//   "og:description": "How to implement and administer AI Assistants locally.",
//   "og:title": "An AI Assistant Development Lifecycle | Anders Ramsay - Designing and Building Digital Products",
//   "scrapeId": "16d1ef53-cd8a-4947-80aa-8e84032e1302",
//   "sourceURL": "https://www.anders.co/blog/an-ai-assistant-development-lifecycle/",
//   "url": "https://www.anders.co/blog/an-ai-assistant-development-lifecycle/",
//   "statusCode": 200
// },

// flow: get all source links, call fcApp.batchScrapeUrls(links),
// # Process results into DocPage objects
// doc_pages = []
// for result in crawl_results["data"]:
//     if result.get("markdown"):
//         doc_pages.append(
//             DocPage(
//                 title=result.get("metadata", {}).get("title", "Untitled"),
//                 content=result["markdown"],
//                 url=result.get("metadata", {}).get("url", ""),
//             )

/**
 * RAG process:
 * scraper -> pull docs -> save doc pages
 * DocRAG: initiate embeddings (OpenAI) and vector store (Chroma?)
 */

// langsmith tracing example
// import { ChatOpenAI } from "langchain/chat_models/openai";

// const llm = new ChatOpenAI();
// await llm.invoke("Hello, world!");

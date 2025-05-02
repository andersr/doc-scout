interface DocPage {
  title: string;
  content: string;
  url: string;
}

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

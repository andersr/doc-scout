/**
 * Deprecated, use AppParams instead
 */
export const PARAMS = {
  COLLECTION_IDS: "collectionIds",
  COLLECTION_NAME: "collectionName",
  EMAIL: "email",
  ERROR: "error",
  FILE: "file",
  FILES: "files",
  ID: "id",
  IDS: "ids",
  INTENT: "intent",
  MESSAGE: "message",
  NAME: "name",
  NAMESPACE: "namespace",
  QUERY: "query",
  SOURCE: "source",
  URL: "url",
  URLS: "urls",
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const APP_PARAMS = ["file_list"] as const;
export type AppParam = (typeof APP_PARAMS)[number];

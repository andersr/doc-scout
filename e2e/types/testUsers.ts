/**
 * Will be turned into email addressess and should be all lowercase
 * Each env should have its own instance of test users
 */
export const TestUserNames = [
  "has_docs",
  "new_docs_add_files",
  "new_docs_validate",
  "new_docs_redirect",
  "new_docs_redirect_multidoc",
  "chat_bot_reply",
  "chat_copy_clipboard",
  "no_docs",
  "doc_delete",
] as const;

export type CreateTestUserInput = { email: string };

const keyTuples = TestUserNames.map((k) => [k, k]);

export type TestUserNames = (typeof TestUserNames)[number];
export const TEST_USERS: Record<TestUserNames, TestUserNames> =
  Object.fromEntries(keyTuples);

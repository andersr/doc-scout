import { ChatPromptTemplate } from "@langchain/core/prompts";
import { pull } from "langchain/hub";

export async function getPrompt() {
  const promptTemplate = await pull<ChatPromptTemplate>("rlm/rag-prompt");
  // console.log("promptTemplate: ", promptTemplate);
  return promptTemplate;
}

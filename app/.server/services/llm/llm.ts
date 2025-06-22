import { ChatOpenAI } from "@langchain/openai";
import { ENV } from "~/.server/ENV";

export const llm = new ChatOpenAI({
  apiKey: ENV.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0,
});

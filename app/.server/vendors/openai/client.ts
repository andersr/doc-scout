import OpenAI from "openai";
import { ENV } from "~/.server/ENV";

export const openAiClient = new OpenAI({
  apiKey: ENV.OPENAI_API_KEY,
});

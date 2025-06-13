import OpenAI from "openai";
import { ENV } from "../../ENV";

export const openAiClient = new OpenAI({
  apiKey: ENV.OPENAI_API_KEY,
});

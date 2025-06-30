/* eslint-disable @typescript-eslint/no-unused-vars */
// import { generateGraph } from "./generateGraph";

const BOT_REPLY = "BOT REPLY";

export type BotResponse = {
  botResponse: string;
};

export async function answerQuery({
  namespace,
  query,
}: {
  namespace: string;
  query: string;
}) {
  return BOT_REPLY;
}

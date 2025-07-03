/* eslint-disable @typescript-eslint/no-unused-vars */

const BOT_REPLY = "BOT REPLY"; // TODO: move to common config

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

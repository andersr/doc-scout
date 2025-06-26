import { generateGraph, type GenerateGraphInput } from "./generateGraph";

export async function answerQuery({
  namespace,
  query,
  sourceIds,
}: GenerateGraphInput & {
  query: string;
}) {
  const graph = await generateGraph({
    namespace,
    sourceIds,
  });

  const result = await graph.invoke({
    question: query,
  });

  return result.answer;
}

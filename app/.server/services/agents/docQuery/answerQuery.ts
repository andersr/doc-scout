import { generateGraph } from "./generateGraph";

export async function answerQuery({
  namespace,
  query,
}: {
  namespace: string;
  query: string;
}) {
  const graph = await generateGraph({
    namespace,
  });

  const result = await graph.invoke({
    question: query,
  });

  return result.answer;
}

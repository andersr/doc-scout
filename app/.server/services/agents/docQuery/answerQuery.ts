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

  // TODO: also return context?
  return result.answer;
}

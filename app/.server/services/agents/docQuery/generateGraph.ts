import type { Document } from "@langchain/core/documents";
import { PromptTemplate } from "@langchain/core/prompts";
import { Annotation, StateGraph } from "@langchain/langgraph";
import { RAG_TEMPLATE } from "~/config/prompts";
import type { VectorMetadataFilter } from "~/types/vectorDoc";
import { llm } from "../../llm/llm";
import { getVectorStore } from "../../vectorStore/getVectorStore";

export interface GenerateGraphInput {
  namespace: string;
  sourceIds: string[];
}

export async function generateGraph({
  namespace,
  sourceIds,
}: GenerateGraphInput) {
  if (sourceIds.length === 0) {
    throw new Error("No source ids provided, cannot complete query.");
  }

  const prompt = PromptTemplate.fromTemplate(RAG_TEMPLATE);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const InputStateAnnotation = Annotation.Root({
    question: Annotation<string>,
  });

  const StateAnnotation = Annotation.Root({
    answer: Annotation<string>,
    context: Annotation<Document[]>,
    question: Annotation<string>,
  });

  const vectorStore = await getVectorStore(namespace);

  // Define application steps
  const retrieve = async (state: typeof InputStateAnnotation.State) => {
    const retrievedDocs = await vectorStore.similaritySearch(
      state.question,
      4, // default value
      { sourceId: { $in: sourceIds } } satisfies VectorMetadataFilter,
    );
    return { context: retrievedDocs };
  };

  const generate = async (state: typeof StateAnnotation.State) => {
    const docsContent = state.context.map((doc) => doc.pageContent).join("\n");
    const messages = await prompt.invoke({
      context: docsContent,
      question: state.question,
    });
    const response = await llm.invoke(messages);
    return { answer: response.content };
  };

  const graph = new StateGraph(StateAnnotation)
    .addNode("retrieve", retrieve)
    .addNode("generate", generate)
    .addEdge("__start__", "retrieve")
    .addEdge("retrieve", "generate")
    .addEdge("generate", "__end__")
    .compile();

  return graph;
}

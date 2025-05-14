import type { Document } from "@langchain/core/documents";
import { PromptTemplate } from "@langchain/core/prompts";
import { Annotation, StateGraph } from "@langchain/langgraph";
import { RAG_TEMPLATE } from "~/config/prompts";
import { llm } from "./llm";
import { getVectorStore } from "./vectorStore";

export async function generateGraph({
  collectionName,
  sources,
}: {
  collectionName: string;
  sources?: string[];
}) {
  const promptTemplate = PromptTemplate.fromTemplate(RAG_TEMPLATE);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const InputStateAnnotation = Annotation.Root({
    question: Annotation<string>,
  });

  const StateAnnotation = Annotation.Root({
    question: Annotation<string>,
    context: Annotation<Document[]>,
    answer: Annotation<string>,
  });

  const vectorStore = await getVectorStore(collectionName);

  // Define application steps
  const retrieve = async (state: typeof InputStateAnnotation.State) => {
    const retrievedDocs = await vectorStore.similaritySearch(
      state.question,
      4, // default value
      sources && sources.length > 0
        ? { sourceId: { $in: sources } }
        : undefined,
    );
    return { context: retrievedDocs };
  };

  const generate = async (state: typeof StateAnnotation.State) => {
    const docsContent = state.context.map((doc) => doc.pageContent).join("\n");
    const messages = await promptTemplate.invoke({
      question: state.question,
      context: docsContent,
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

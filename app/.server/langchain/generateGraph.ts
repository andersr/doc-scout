import type { Document } from "@langchain/core/documents";
import { PromptTemplate } from "@langchain/core/prompts";
import { Annotation, StateGraph } from "@langchain/langgraph";
import { RAG_TEMPLATE } from "~/config/prompts";
import { llm } from "./llm";
import { getVectorStore } from "./vectorStore";

export async function generateGraph({
  collectionName,
}: {
  collectionName: string;
}) {
  const promptTemplate = PromptTemplate.fromTemplate(RAG_TEMPLATE);

  const InputStateAnnotation = Annotation.Root({
    question: Annotation<string>,
  });

  const StateAnnotation = Annotation.Root({
    question: Annotation<string>,
    context: Annotation<Document[]>,
    answer: Annotation<string>,
  });

  // const pineconeIndex = pcClient.Index(collectionName, ENV.PINECONE_HOST);

  // const vectorStore = await PineconeStore.fromExistingIndex(oaiEmbeddings, {
  //   pineconeIndex,
  //   maxConcurrency: 5,
  //   namespace: collectionName,
  // });
  const vectorStore = await getVectorStore(collectionName);

  // Define application steps
  const retrieve = async (state: typeof InputStateAnnotation.State) => {
    const retrievedDocs = await vectorStore.similaritySearch(state.question);
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

import type { Document } from "@langchain/core/documents";
import type { ChatPromptTemplate } from "@langchain/core/prompts";
import { Annotation, StateGraph } from "@langchain/langgraph";
import { PineconeStore } from "@langchain/pinecone";
import { pull } from "langchain/hub";
import { ENV } from "../ENV";
import { pcClient } from "../pinecone/client";
import { oaiEmbeddings } from "./embeddings";
import { llm } from "./llm";
// import { vectorStore } from "./vectorStore";

export async function generateGraph({
  collectionName,
}: {
  collectionName: string;
}) {
  // Define prompt for question-answering
  const promptTemplate = await pull<ChatPromptTemplate>("rlm/rag-prompt");

  // Define state for application
  const InputStateAnnotation = Annotation.Root({
    question: Annotation<string>,
  });

  const StateAnnotation = Annotation.Root({
    question: Annotation<string>,
    context: Annotation<Document[]>,
    answer: Annotation<string>,
  });

  const pineconeIndex = pcClient.Index(collectionName, ENV.PINECONE_HOST);

  const vectorStore = await PineconeStore.fromExistingIndex(oaiEmbeddings, {
    pineconeIndex,
    maxConcurrency: 5,
  });

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
  // console.log("generate: ", generate);

  // return generate;

  const graph = new StateGraph(StateAnnotation)
    .addNode("retrieve", retrieve)
    .addNode("generate", generate)
    .addEdge("__start__", "retrieve")
    .addEdge("retrieve", "generate")
    .addEdge("generate", "__end__")
    .compile();

  return graph;
}

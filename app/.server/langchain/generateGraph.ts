import type { Document } from "@langchain/core/documents";
import { PromptTemplate } from "@langchain/core/prompts";
import { Annotation, StateGraph } from "@langchain/langgraph";
import { PineconeStore } from "@langchain/pinecone";
import { ENV } from "../ENV";
import { pcClient } from "../pinecone/client";
import { oaiEmbeddings } from "./embeddings";
import { llm } from "./llm";
// import { vectorStore } from "./vectorStore";

interface ChatInput {
  prompt: string;
  context: string;
}

// function setPrompt({ prompt, context }: ChatInput) {
//   return `
//   Question: ${prompt}

//   <CONTEXT>
//   ${context}
//   </CONTEXT>

//   Use only the information in documents within the <CONTEXT> block to answer the question. List the corresponding documents used to provide an answer in the order of relevance.  If you are unable to provide an answer based on this information, say you don't know.

//   Answer:  `;
// }

const RAG_TEMPLATE = `
  Question: {question}

  <CONTEXT>
  {context}
  </CONTEXT>

  Use only the information within the <CONTEXT> block to answer the question.  If you are unable to provide an answer based on this information, say you don't know.
    
  Answer:  `;

export async function generateGraph({
  collectionName,
}: {
  collectionName: string;
}) {
  // Define prompt for question-answering
  // const promptTemplate = await pull<ChatPromptTemplate>("rlm/rag-prompt");
  const promptTemplate = PromptTemplate.fromTemplate(RAG_TEMPLATE);

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
    namespace: collectionName,
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

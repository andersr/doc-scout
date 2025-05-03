import { Annotation } from "@langchain/langgraph";
import { vectorStore } from "./vectorStore";

export async function retrieveDocs() {
  // Define state for application
  const InputStateAnnotation = Annotation.Root({
    question: Annotation<string>,
  });

  // Define application steps
  const docs = async (state: typeof InputStateAnnotation.State) => {
    const retrievedDocs = await vectorStore.similaritySearch(state.question);
    return { context: retrievedDocs };
  };

  return docs;
}

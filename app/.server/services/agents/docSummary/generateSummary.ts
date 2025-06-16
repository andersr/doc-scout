import { CREATE_ABSTRACT_INSTRUCTIONS } from "~/data/prompts/createAbstract";
import { openAiClient } from "../../../vendors/openai/client";

export async function generateSummary({ text }: { text: string }) {
  try {
    if (text.trim() === "") {
      console.warn("no text found, cannot generate summary");
      return "";
    }
    const response = await openAiClient.responses.create({
      input: `Create an abstract for the following content:
   
         ${text}`,
      instructions: CREATE_ABSTRACT_INSTRUCTIONS,
      model: "gpt-4.1-mini",
    });

    return response.output_text;
  } catch (err) {
    console.error(err);

    return "";
  }
}

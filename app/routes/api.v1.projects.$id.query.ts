import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { data } from "react-router";
import { z } from "zod";
import { apiError } from "~/.server/api/apiError";
import { generateGraph } from "~/.server/langchain/generateGraph";
import { requireProjectViaKey } from "~/.server/projects/requireProjectViaKey";
import { APIError, type ApiResponse } from "~/types/api";
import type { Route } from "../+types/root";

export async function loader(args: Route.LoaderArgs) {
  try {
    const project = await requireProjectViaKey(args);

    return data<ApiResponse>({
      errorMessage: "",
      successMessage: "This worked",
      errors: null,
      ok: true,
      data: project,
    });
  } catch (error: unknown) {
    return apiError(error);
  }
}

// TODO: use zod for node request validation
const querySchema = z.object({
  prompt: z.string().min(1),
});

export async function action(args: Route.ActionArgs) {
  try {
    const project = await requireProjectViaKey(args);

    if (!project.collectionName) {
      throw new APIError(ReasonPhrases.BAD_REQUEST, StatusCodes.BAD_REQUEST);
    }

    const payload = await args.request.json();
    const validated = querySchema.parse(payload);

    const graph = await generateGraph({
      collectionName: project.collectionName,
    });

    const inputs = {
      question: validated.prompt,
    };

    const result = await graph.invoke(inputs);
    console.info(result.answer);

    return data<ApiResponse>({
      errorMessage: "",
      successMessage: "",
      errors: null,
      ok: true,
      data: {
        answer: result.answer,
      },
    });
  } catch (error: unknown) {
    return apiError(error);
  }
}

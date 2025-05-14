import { data } from "react-router";
import { apiError } from "~/.server/api/apiError";
import { requireProjectViaKey } from "~/.server/projects/requireProjectViaKey";
import { type ApiResponse } from "~/types/api";
// import type { ProjectClient } from "~/types/project";
import type { Route } from "../+types/root";

export async function loader(args: Route.LoaderArgs) {
  try {
    const projectClient = await requireProjectViaKey(args);

    // const consumerData: ProjectClient = {
    //   projectName: project.name,
    //   collectionName: project.collectionName ?? "", // for now
    //   createdAt: project.createdAt ?? new Date(), // for now
    //   publicId: project.publicId,
    //   sources: project.sources.map((s) => ({ name: s.name, id: s.publicId })),
    // };

    return data<ApiResponse>({
      errorMessage: "",
      successMessage: "This worked",
      errors: null,
      ok: true,
      data: projectClient,
    });
  } catch (error: unknown) {
    return apiError(error);
  }
}

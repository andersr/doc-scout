import type { Source } from "@prisma/client";
import { appRoutes } from "~/shared/appRoutes";

export function setCreateSourcesRedirectRoute(sources: Source[]) {
  return sources.length === 1
    ? appRoutes("/docs/:id", { id: sources[0].publicId })
    : appRoutes("/");
}

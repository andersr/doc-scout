import { zodResolver } from "@hookform/resolvers/zod";
import Markdown from "react-markdown";
import {
  data,
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { generateGraph } from "~/.server/langchain/generateGraph";
import { requireProjectById } from "~/.server/projects/requireProjectById";
import { requireUser } from "~/.server/users/requireUser";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { playgroundSchema } from "~/lib/formSchemas";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import type { RouteData } from "~/types/routeData";
import type { Route } from "./+types/_auth.projects.$id._index";

const PAGE_TITLE = "Playground";

export const handle: RouteData = {
  pageTitle: PAGE_TITLE,
};

export function meta() {
  return [{ title: PAGE_TITLE }];
}

type FormData = z.infer<typeof playgroundSchema>;
const resolver = zodResolver(playgroundSchema);

export async function loader(args: Route.LoaderArgs) {
  const user = await requireUser(args);
  try {
    const project = await requireProjectById({ params: args.params, user });

    return { project };
  } catch (error) {
    console.error("error: ", error);
    return { currentUser: null, project: null };
  }
}

export default function ProjectPlayground() {
  const { project } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const pendingUI = useNavigation();

  const {
    formState: { errors, isValid },
    handleSubmit,
    register,
  } = useRemixForm<FormData>({
    mode: "onSubmit",
    resolver,
  });

  return (
    <div>
      <Form onSubmit={handleSubmit} method="POST">
        <div className="mb-2">
          <Label className="pb-2">Question</Label>
          <textarea
            {...register("question")}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          ></textarea>
          {errors.question && <p>{errors.question.message}</p>}
        </div>
        <div className="py-4">
          <h2>Sources</h2>
          <ul>
            {project?.sources.map((s) => (
              <li key={s.publicId}>
                <label className={twMerge("cursor-pointer")}>
                  <input
                    {...register("sources")}
                    type="checkbox"
                    className="mr-3 cursor-pointer disabled:opacity-70"
                    value={s.publicId}
                  />
                  {s.name}
                </label>
              </li>
            ))}
          </ul>
        </div>
        <Button type="submit" disabled={!isValid}>
          {pendingUI.state !== "idle" ? "Asking..." : "Ask"}
        </Button>
      </Form>
      {actionData?.answer && (
        <div className="mt-4">
          <h2 className=" text-xl mb-2">Answer</h2>
          <div className="prose dark:prose-invert">
            <Markdown>{actionData?.answer}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
}

export async function action(args: Route.ActionArgs) {
  const user = await requireUser(args);
  try {
    const project = await requireProjectById({ params: args.params, user });

    if (!project.collectionName) {
      throw new Error("missing collection name");
    }

    const {
      data,
      errors,
      receivedValues: defaultValues,
    } = await getValidatedFormData<FormData>(args.request, resolver);

    if (errors) {
      return { defaultValues, errors };
    }

    const graph = await generateGraph({
      namespace: project.collectionName,
      sources: Array.isArray(data.sources) ? data.sources : [data.sources],
    });

    const inputs = {
      question: data.question,
    };

    const result = await graph.invoke(inputs);

    return {
      answer: result.answer,
      errorMessage: "",
      ok: true,
    };
  } catch (error) {
    console.error("error: ", error);
    return data({
      answer: "",
      errorMessage: INTENTIONALLY_GENERIC_ERROR_MESSAGE,
      ok: false,
    });
  }
}

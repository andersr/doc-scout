import { zodResolver } from "@hookform/resolvers/zod";
import Markdown from "react-markdown";
import { data, Form, useActionData, useNavigation } from "react-router";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { z } from "zod";
import { generateGraph } from "~/.server/langchain/generateGraph";
import { requireProjectById } from "~/.server/projects/requireProjectById";
import { requireUser } from "~/.server/users/requireUser";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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
    const project = await requireProjectById({ user, params: args.params });

    return { project };
  } catch (error) {
    console.error("error: ", error);
    return { currentUser: null, project: null };
  }
}

export default function ProjectPlayground() {
  const actionData = useActionData<typeof action>();

  const pendingUI = useNavigation();

  const {
    handleSubmit,
    formState: { errors, isValid },
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
          <Input type="text" {...register("question")} />
          {errors.question && <p>{errors.question.message}</p>}
        </div>
        <Button type="submit" disabled={!isValid}>
          {pendingUI.state !== "idle" ? "Asking..." : "Ask"}
        </Button>
      </Form>
      {actionData?.answer && (
        <div className="mt-4">
          <h2 className=" text-xl mb-2">Answer</h2>
          <Markdown>{actionData?.answer}</Markdown>
        </div>
      )}
    </div>
  );
}

export async function action(args: Route.ActionArgs) {
  const user = await requireUser(args);
  try {
    const project = await requireProjectById({ user, params: args.params });

    if (!project.collectionName) {
      throw new Error("missing collection name");
    }

    const {
      errors,
      data,
      receivedValues: defaultValues,
    } = await getValidatedFormData<FormData>(args.request, resolver);

    if (errors) {
      return { errors, defaultValues };
    }

    const graph = await generateGraph({
      collectionName: project.collectionName,
    });

    const inputs = {
      question: data.question,
    };

    const result = await graph.invoke(inputs);

    return {
      errorMessage: "",
      ok: true,
      answer: result.answer,
    };
  } catch (error) {
    console.error("error: ", error);
    return data({
      errorMessage: INTENTIONALLY_GENERIC_ERROR_MESSAGE,
      ok: false,
      answer: "",
    });
  }
}

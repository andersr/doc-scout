import { zodResolver } from "@hookform/resolvers/zod";
import { Role } from "@prisma/client";
import { data, Form, redirect, useNavigation } from "react-router";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { z } from "zod";
import { requireUser } from "~/.server/users/requireUser";
import { generateId } from "~/.server/utils/generateId";
import { slugify } from "~/.server/utils/slugify";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { newProjectSchema } from "~/lib/formSchemas";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import type { ActionData } from "~/types/actionData";
import type { RouteData } from "~/types/routeData";
import type { Route } from "./+types/_auth.projects.new";

const PAGE_TITLE = "New Project";

type FormData = z.infer<typeof newProjectSchema>;
const resolver = zodResolver(newProjectSchema);

export const handle: RouteData = {
  pageTitle: PAGE_TITLE,
};

export function meta() {
  return [{ title: PAGE_TITLE }];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser({ request });
}

export default function NewProject() {
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
    <Form onSubmit={handleSubmit} method="POST">
      <div className="mb-2">
        <Label className="pb-2">Name</Label>
        <Input type="text" {...register("name")} />
        {errors.name && <p>{errors.name.message}</p>}
      </div>
      <Button type="submit" disabled={!isValid}>
        {pendingUI.state !== "idle" ? "Creating..." : "Create Project"}
      </Button>
    </Form>
  );
}

export async function action({ request }: Route.ActionArgs) {
  try {
    const internalUser = await requireUser({ request });

    const {
      errors,
      data,
      receivedValues: defaultValues,
    } = await getValidatedFormData<FormData>(request, resolver);

    if (errors) {
      return { errors, defaultValues };
    }

    const collectionName = slugify(data.name, {
      replacement: "_",
      lower: true,
    });

    const project = await prisma.project.create({
      data: {
        name: data.name,
        collectionName,
        publicId: generateId(),
        createdAt: new Date(),
        members: {
          create: {
            role: Role.ADMIN,
            user: {
              connect: {
                id: internalUser.id,
              },
            },
          },
        },
      },
    });

    return redirect(appRoutes("/projects/:id", { id: project.publicId }));
  } catch (error) {
    console.error("submission error: ", error);
    return data<ActionData>({
      errorMessage: INTENTIONALLY_GENERIC_ERROR_MESSAGE,
      ok: false,
    });
  }
}

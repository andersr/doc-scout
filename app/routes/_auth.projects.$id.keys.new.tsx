import { zodResolver } from "@hookform/resolvers/zod";
import { data, Form, redirect, useNavigation } from "react-router";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { z } from "zod";
import { requireUser } from "~/.server/users/requireUser";
import { generateKey } from "~/.server/utils/generateKey";
import { generateHash } from "~/.server/utils/hashUtils";
import { requireParam } from "~/.server/utils/requireParam";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import type { ActionData } from "~/types/actionData";
import type { RouteData } from "~/types/routeData";
import type { Route } from "./+types/_auth.projects.$id.sources.new";

const SECTION_NAME = "Add API Key";

const schema = z.object({
  name: z.string().min(1),
});

type FormData = z.infer<typeof schema>;
const resolver = zodResolver(schema);

export const handle: RouteData = {
  pageTitle: SECTION_NAME,
};

export function meta() {
  return [{ title: SECTION_NAME }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const currentUser = await requireUser({ request });
  const projectId = requireParam({ params, key: "id" });

  const projectMembership = currentUser?.projectMemberships.find(
    (pm) => pm.project?.publicId === projectId,
  );

  // Add alert via AlertProvider OR flash message provider
  if (!projectMembership) {
    console.warn("user is not a member");
    throw redirect(appRoutes("/"));
  }
  if (!projectMembership.project) {
    console.warn("No project found");
    throw redirect(appRoutes("/"));
  }

  return { project: projectMembership.project };
}
export default function NewSource() {
  // const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  // const [inputValue, setInputValue] = useState("");

  // const submitDisabled = navigation.state === "submitting";

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
      <div className="pb-4">
        <Label>Name</Label>
        <Input type="text" {...register("name")} />
        {errors.name && <p>{errors.name.message}</p>}
      </div>
      <Button type="submit" disabled={!isValid}>
        {navigation.state !== "idle" ? "Adding..." : "Add Key"}
      </Button>
    </Form>
  );
}

export async function action({ request, params }: Route.ActionArgs) {
  const internalUser = await requireUser({ request });

  try {
    const {
      errors,
      data,
      receivedValues: defaultValues,
    } = await getValidatedFormData<FormData>(request, resolver);

    if (errors) {
      // The keys "errors" and "defaultValues" are picked up automatically by useRemixForm
      return { errors, defaultValues };
    }

    const projectPublicId = requireParam({ params, key: "id" });
    // TODO: turn into util
    const projectMembership = internalUser?.projectMemberships.find(
      (pm) => pm.project?.publicId === projectPublicId,
    );

    if (!projectMembership) {
      throw new Error(
        "No matching project found or current user is not a member",
      );
    }

    const project = projectMembership.project;

    if (!project?.id) {
      throw new Error("No project id found or current user is not a member");
    }

    const key = generateKey();

    const secret = await generateHash(key);

    await prisma.key.create({
      data: {
        name: data.name,
        createdAt: new Date(),
        secret,
        project: {
          connect: {
            id: project.id,
          },
        },
      },
    });

    // display modal with

    // return redirect(appRoutes("/projects/:id/keys", { id: project.publicId }));
  } catch (error) {
    console.error("URL submission error: ", error);
    return data<ActionData>({
      url: "",
      errorMessage: INTENTIONALLY_GENERIC_ERROR_MESSAGE,
      ok: false,
    });
  }
}

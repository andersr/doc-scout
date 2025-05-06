import { Role } from "@prisma/client";
import { useState } from "react";
import {
  data,
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { twMerge } from "tailwind-merge";
import { getClientUser } from "~/.server/users/getClientUser";
import { requireInternalUser } from "~/.server/users/requireInternalUser";
import { generateId } from "~/.server/utils/generateId";
import { slugify } from "~/.server/utils/slugify";
import { MainLayout } from "~/components/MainLayout";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import { PARAMS } from "~/shared/params";
import type { Route } from "./+types/dashboard";

export function meta() {
  return [{ title: "New Project" }, { name: "description", content: "" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const currentUser = await getClientUser({ request, require: true });

    return { currentUser };
  } catch (error) {
    console.error("error: ", error);
    return { currentUser: null };
  }
}

// Define a consistent return type for the action
type ActionData = {
  errorMessage?: string;
  successMessage?: string;
  ok: boolean;
};

export async function action({ request }: Route.ActionArgs) {
  try {
    const internalUser = await requireInternalUser({ request, require: true });

    const formPayload = Object.fromEntries(await request.formData());
    const nameData = formPayload[PARAMS.NAME];
    const name = nameData.toString().trim();

    const collectionName = slugify(name, { replacement: "_", lower: true });

    const project = await prisma.project.create({
      data: {
        name,
        collectionName,
        publicId: generateId(),
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

    return redirect(appRoutes("/dashboard", { id: project.publicId }));
  } catch (error) {
    console.error("URL submission error: ", error);
    return data<ActionData>({
      errorMessage: INTENTIONALLY_GENERIC_ERROR_MESSAGE,
      ok: false,
    });
  }
}

export default function NewProject() {
  const { currentUser } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [inputValue, setInputValue] = useState("");

  const submitDisabled = navigation.state === "submitting";

  return (
    <MainLayout currentUser={currentUser}>
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-2xl font-bold mb-6">New Project</h1>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <Form method="POST" className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="url">Name</label>
              <input
                type="text"
                name={PARAMS.NAME}
                placeholder="Project name"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="rounded-md border border-grey-2 bg-transparent p-3 text-base leading-normal placeholder:font-normal placeholder:text-grey-3"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitDisabled}
              className={twMerge(
                "clickable bg-light-blue text-dark-blue font-medium p-4 rounded w-full border cursor-pointer",
                submitDisabled ? "bg-grey-1 text-grey-3 cursor-wait" : ""
              )}
            >
              {submitDisabled ? "Submitting..." : "Create Project"}
            </button>
          </Form>

          {actionData?.errorMessage && (
            <div className="mt-4 text-center font-semibold text-red-400">
              {actionData.errorMessage}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

import { Role } from "@prisma/client";
import { useState } from "react";
import {
  data,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { twMerge } from "tailwind-merge";
import { requireUser } from "~/.server/users/requireUser";
import { generateId } from "~/.server/utils/generateId";
import { slugify } from "~/.server/utils/slugify";
import { FormContainer } from "~/components/forms/FormContainer";
import { PageTitle } from "~/components/PageTitle";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
import { PARAMS } from "~/shared/params";
import type { ActionData } from "~/types/actionData";
import type { RouteData } from "~/types/routeData";
import type { Route } from "./+types/_auth.projects.new";

const PAGE_TITLE = "New Project";

export const handle: RouteData = {
  pageTitle: PAGE_TITLE,
};

export function meta() {
  return [{ title: PAGE_TITLE }, { name: "description", content: "" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const currentUser = await requireUser({ request });

  return { currentUser };
}

export default function NewProject() {
  const { currentUser } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const [inputValue, setInputValue] = useState("");

  const submitDisabled =
    inputValue.trim().length === 0 || navigation.state !== "idle";

  return (
    <div className="">
      <PageTitle>New Project</PageTitle>
      <FormContainer>
        <div className="flex flex-col gap-1">
          <label htmlFor={PARAMS.NAME}>Name</label>
          <input
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
            "p-4 rounded w-full border border-blue-400 disabled:border-gray-300 disabled:text-gray-400 cursor-pointer ",
            navigation.state !== "idle" ? "cursor-wait" : "",
          )}
        >
          {navigation.state !== "idle" ? "Submitting..." : "Create Project"}
        </button>
      </FormContainer>

      {actionData?.errorMessage && (
        <div className="mt-4 text-center font-semibold text-red-400">
          {actionData.errorMessage}
        </div>
      )}
    </div>
  );
}

export async function action({ request }: Route.ActionArgs) {
  try {
    const internalUser = await requireUser({ request });

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

    return redirect(appRoutes("/projects/:id", { id: project.publicId }));
  } catch (error) {
    console.error("URL submission error: ", error);
    return data<ActionData>({
      errorMessage: INTENTIONALLY_GENERIC_ERROR_MESSAGE,
      ok: false,
    });
  }
}

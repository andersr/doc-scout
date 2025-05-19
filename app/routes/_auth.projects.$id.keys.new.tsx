import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "react-router";
import { getValidatedFormData, useRemixForm } from "remix-hook-form";
import { z } from "zod";
import { requireUser } from "~/.server/users/requireUser";
import { genApiKey } from "~/.server/utils/genApiKey";
import { genRandomString } from "~/.server/utils/genRandomString";
import { generateHash } from "~/.server/utils/hashUtils";
import { requireParam } from "~/.server/utils/requireParam";
import { CopyButton } from "~/components/buttons/CopyButton";
import { IconButton } from "~/components/buttons/IconButton";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useCopyToClipboard } from "~/hooks/useCopyToClipboard";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";
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

export async function loader(args: Route.LoaderArgs) {
  const currentUser = await requireUser(args);
  const projectId = requireParam({ key: "id", params: args.params });

  const projectMembership = currentUser?.projectMemberships.find(
    (pm) => pm.project?.publicId === projectId,
  );

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
  const { project } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const pendingUi = useNavigation();
  const navigate = useNavigate();
  const [showKey, setShowKey] = useState(false);
  const [copyDone, setCopyDone] = useState(false);
  const [viewInput, setViewInput] = useState(false);

  const { didCopy, handleCopyClick } = useCopyToClipboard();

  useEffect(() => {
    if (!showKey && actionData?.ok && actionData?.apiKey) {
      setShowKey(true);
    }
  }, [actionData, showKey]);

  useEffect(() => {
    if (copyDone) {
      setTimeout(() => {
        setCopyDone(false);
      }, 3000);
    }
  }, [copyDone]);

  const {
    formState: { errors, isValid },
    handleSubmit,
    register,
  } = useRemixForm<FormData>({
    mode: "onSubmit",
    resolver,
  });

  return (
    <>
      {showKey ? (
        <div className="w-full">
          <p>
            This is the API Key &ldquo;{actionData?.name}&rdquo;.{" "}
            <span className="font-semibold">
              It will only be displayed once. Copy it now and store in a safe
              place.
            </span>{" "}
          </p>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              type={viewInput ? "text" : "password"}
              value={actionData?.apiKey}
              className="flex-1"
            />
            <IconButton
              name={viewInput ? "visibility_off" : "visibility"}
              onClick={() => setViewInput(!viewInput)}
            />
          </div>
          <div className="flex items-center gap-2">
            {actionData?.apiKey && (
              <CopyButton
                copyDone={copyDone}
                onClick={() => {
                  handleCopyClick(actionData.apiKey);
                  setCopyDone(true);
                }}
              />
            )}
            <Button
              disabled={!didCopy}
              onClick={() =>
                navigate(
                  appRoutes("/projects/:id/keys", { id: project.publicId }),
                )
              }
            >
              Done
            </Button>
          </div>
        </div>
      ) : (
        <Form onSubmit={handleSubmit} method="POST">
          <div className="pb-4">
            <Label className="pb-2">Name</Label>
            <Input
              type="text"
              placeholder="E.g. Dev Key"
              {...register("name")}
            />
            {errors.name && <p>{errors.name.message}</p>}
          </div>
          <Button type="submit" disabled={!isValid}>
            {pendingUi.state !== "idle" ? "Creating..." : "Continue"}
          </Button>
        </Form>
      )}
    </>
  );
}

export async function action(args: Route.ActionArgs) {
  const internalUser = await requireUser(args);

  try {
    const {
      data: formData,
      errors,
      receivedValues: defaultValues,
    } = await getValidatedFormData<FormData>(args.request, resolver);

    if (errors) {
      // The keys "errors" and "defaultValues" are picked up automatically by useRemixForm
      return { defaultValues, errors };
    }

    const projectPublicId = requireParam({ key: "id", params: args.params });
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

    const randomString = genRandomString();
    const secret = await generateHash(randomString);

    const key = await prisma.key.create({
      data: {
        createdAt: new Date(),
        name: formData.name,
        project: {
          connect: {
            id: project.id,
          },
        },
        secret,
      },
    });

    const apiKey = genApiKey(key.id, randomString);

    return {
      apiKey,
      errorMessage: "",
      name: key.name,
      ok: true,
    };
  } catch (error) {
    console.error("error: ", error);
    return {
      apiKey: "",
      errorMessage: INTENTIONALLY_GENERIC_ERROR_MESSAGE,
      name: "",
      ok: false,
    };
  }
}

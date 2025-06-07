import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { requireUser } from "~/.server/sessions/requireUser";
import { generateId } from "~/.server/utils/generateId";
import { Checkbox } from "~/components/checkbox";
import { PageTitle } from "~/components/page-title";
import { Button } from "~/components/ui/button";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import { INTENTIONALLY_GENERIC_ERROR_MESSAGE } from "~/shared/messages";

export async function loader(args: LoaderFunctionArgs) {
  const { internalUser } = await requireUser(args);

  const docs = await prisma.source.findMany({
    where: {
      ownerId: internalUser.id,
    },
  });

  return {
    docs,
    title: "New Chat",
  };
}

export default function NewDocsRoute() {
  const { docs, title } = useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const submitDisabled =
    navigation.state !== "idle" || selectedItems.length === 0;

  return (
    <div>
      <PageTitle title={title} />
      <Form method="POST" className="flex flex-col gap-6">
        <ul>
          {docs.map((item) => (
            <li key={item.publicId}>
              <Checkbox
                name={KEYS.ids}
                checked={selectedItems.includes(item.publicId)}
                value={item.publicId}
                onChange={() => {
                  if (selectedItems.includes(item.publicId)) {
                    const removed = selectedItems.filter(
                      (i) => i !== item.publicId,
                    );
                    setSelectedItems([...removed]);
                  } else {
                    setSelectedItems([...selectedItems, item.publicId]);
                  }
                }}
              >
                {item.name ?? item.fileName}
              </Checkbox>
            </li>
          ))}
        </ul>

        <Button type="submit" disabled={submitDisabled}>
          {navigation.state === "submitting" ? "Processing..." : "Continue"}
        </Button>
      </Form>

      {actionData?.errorMessage && (
        <div className="mt-4 text-center font-semibold text-red-400">
          {actionData.errorMessage}
        </div>
      )}
    </div>
  );
}

export async function action(args: ActionFunctionArgs) {
  const { request } = args;
  const { internalUser } = await requireUser(args);
  try {
    const formData = await request.formData();
    const ids = formData.getAll(KEYS.ids).map((id) => id.toString());

    if (!ids || ids.length === 0) {
      return {
        errorMessage: "At least one doc is required.",
        ok: false,
      };
    }

    const sources = await prisma.source.findMany({
      where: {
        publicId: {
          in: ids,
        },
      },
    });

    const chat = await prisma.chat.create({
      data: {
        createdAt: new Date(),
        ownerId: internalUser.id,
        publicId: generateId(),
        sources: {
          createMany: {
            data: sources.map((s) => ({
              sourceId: s.id,
            })),
          },
        },
      },
    });

    return redirect(
      appRoutes("/chats/:id", {
        id: chat.publicId,
      }),
    );
  } catch (error) {
    console.error("create error: ", error);
    return {
      errorMessage:
        error instanceof Error && error.message
          ? error.message
          : INTENTIONALLY_GENERIC_ERROR_MESSAGE,
      ok: false,
    };
  }
}

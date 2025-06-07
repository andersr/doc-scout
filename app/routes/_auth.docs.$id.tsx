import type { LoaderFunctionArgs } from "react-router";
import { Link, redirect, useFetcher, useLoaderData } from "react-router";
import { ENV } from "~/.server/ENV";
import { requireUser } from "~/.server/sessions/requireUser";
import { generateId } from "~/.server/utils/generateId";
import { requireRouteParam } from "~/.server/utils/requireRouteParam";
import { serverError } from "~/.server/utils/serverError";
import { Icon } from "~/components/icon";
import { ActionButton } from "~/components/ui/ActionButton";
import { PageHeading } from "~/components/ui/PageHeading";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import { formatDateTime } from "~/utils/formatDateTime";
import { setSourceTitle } from "~/utils/setSourceTitle";
import type { Route } from "./+types/_auth.docs.$id";

export async function loader(args: LoaderFunctionArgs) {
  const publicId = requireRouteParam({
    key: KEYS.id,
    params: args.params,
  });

  const source = await prisma.source.findUnique({
    include: {
      chats: {
        include: {
          chat: {
            include: {
              messages: true,
            },
          },
        },
      },
    },
    where: {
      publicId,
    },
  });

  if (!source) {
    // add flash message
    throw redirect(appRoutes("/docs"));
  }

  return {
    cdn: ENV.CDN_HOST,
    source,
    title: setSourceTitle(source),
  };
}

export default function DocDetailsLayout() {
  const { cdn, source, title } = useLoaderData<typeof loader>();

  const fetcher = useFetcher();

  return (
    <>
      <PageHeading pageTitle={title}>
        <fetcher.Form method="POST" className="">
          <ActionButton type="submit" disabled={fetcher.state !== "idle"}>
            {fetcher.state !== "idle" ? "Loading..." : "New Doc Chat"}
          </ActionButton>
        </fetcher.Form>
      </PageHeading>
      <div className="">
        {source.storagePath && (
          <a
            href={`${cdn}/${source.storagePath}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-blue-500"
          >
            <div className="underline">{source.fileName}</div>{" "}
            <Icon name="NEW_WINDOW" fontSize="20px" />
          </a>
        )}
      </div>
      <div className="">
        <p>{source.summary}</p>
      </div>
      <div>
        <h2>Recent Chats</h2>
        <ul>
          {source.chats?.map((c) => (
            <li key={c.chat?.publicId}>
              {c.chat?.publicId && (
                <Link to={appRoutes("/chats/:id", { id: c.chat?.publicId })}>
                  {c.chat?.messages && c.chat?.messages?.length > 0
                    ? c.chat?.messages[0].text
                    : "No messages"}{" "}
                  ({formatDateTime({ d: c.chat.createdAt, withTime: true })})
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export async function action(args: Route.ActionArgs) {
  const { internalUser } = await requireUser(args);
  try {
    const sourcePublicId = requireRouteParam({
      key: KEYS.id,
      params: args.params,
    });

    const source = await prisma.source.findUniqueOrThrow({
      where: {
        publicId: sourcePublicId,
      },
    });

    const chat = await prisma.chat.create({
      data: {
        createdAt: new Date(),
        ownerId: internalUser.id,
        publicId: generateId(),
        sources: {
          create: {
            sourceId: source.id,
          },
        },
      },
    });

    return redirect(appRoutes("/chats/:id", { id: chat.publicId }));
  } catch (error) {
    console.error("error: ", error);
    return serverError(error);
  }
}

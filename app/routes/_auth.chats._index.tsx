import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import { requireUser } from "~/.server/sessions/requireUser";
import { ActionLink } from "~/components/ui/ActionLink";
import { PageHeading } from "~/components/ui/PageHeading";

import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { formatDateTime } from "~/utils/formatDateTime";

export async function loader(args: LoaderFunctionArgs) {
  const { internalUser } = await requireUser(args);

  const chats = await prisma.chat.findMany({
    include: {
      messages: true,
    },
    where: {
      ownerId: internalUser.id,
    },
  });

  return {
    chats,
    title: "Chats",
  };
}

export default function DocsList() {
  const { chats, title } = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeading pageTitle={title}>
        <ActionLink to={appRoutes("/chats/new")}>New Chat</ActionLink>
      </PageHeading>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {chats.map((c) => (
          <Link
            key={c.publicId}
            to={appRoutes("/chats/:id", { id: c.publicId })}
            className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
          >
            <h2 className="text-lg font-medium">
              {c.messages.length > 0 ? c.messages[0].text : "Empty chat"}
            </h2>
            <div className="mt-2 text-xs text-gray-400">
              Created:{" "}
              {c.createdAt
                ? formatDateTime({ d: c.createdAt, withTime: true })
                : "N/A"}
            </div>
          </Link>
        ))}
      </ul>
    </>
  );
}

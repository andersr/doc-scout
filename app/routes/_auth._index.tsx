import type { LoaderFunctionArgs } from "react-router";
import { Link, redirect, useLoaderData } from "react-router";
import { requireUser } from "~/.server/services/sessions/requireUser";
import { ActionLink } from "~/components/ui/ActionLink";
import { PageHeading } from "~/components/ui/PageHeading";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { formatDateTime } from "~/utils/formatDateTime";
import { setSourceTitle } from "~/utils/setSourceTitle";

export async function loader(args: LoaderFunctionArgs) {
  const { internalUser } = await requireUser(args);

  // const userDocs = await prisma.source.count({
  //   where: {
  //     ownerId: internalUser.id,
  //   },
  // });

  const docs = await prisma.source.findMany({
    orderBy: {
      createdAt: "desc",
    },
    where: {
      ownerId: internalUser.id,
    },
  });

  if (docs.length === 0) {
    return redirect(appRoutes("/docs/new"));
  }

  const [recentDocs, recentChats] = await Promise.all([
    prisma.source.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
      where: {
        ownerId: internalUser.id,
      },
    }),
    prisma.chat.findMany({
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
      where: {
        ownerId: internalUser.id,
      },
    }),
  ]);

  return {
    docs,
    recentChats,
    recentDocs,
    title: "My Docs",
  };
}

export default function Dashboard() {
  const { docs, title } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-8">
      <PageHeading pageTitle={title}>
        <ActionLink to={appRoutes("/docs/new")}>Add Docs</ActionLink>
      </PageHeading>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {docs.map((d) => (
          <Link
            key={d.publicId}
            to={appRoutes("/docs/:id", { id: d.publicId })}
            className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
          >
            <h2 className="text-lg font-medium">{setSourceTitle(d)}</h2>
            <div className="mt-2 text-xs text-gray-400">
              Created:{" "}
              {d.createdAt
                ? formatDateTime({ d: d.createdAt, withTime: true })
                : "N/A"}
            </div>
          </Link>
        ))}
      </ul>
      {/* <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Documents</h2>
            <Link
              to={appRoutes("/docs")}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentDocs.length > 0 ? (
              recentDocs.map((doc) => (
                <Link
                  key={doc.publicId}
                  to={appRoutes("/docs/:id", { id: doc.publicId })}
                  className="block rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                >
                  <h3 className="truncate font-medium">
                    {doc.title || doc.name || doc.fileName || "Untitled"}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                    {doc.summary || "No summary available"}
                  </p>
                  <div className="mt-2 text-xs text-gray-400">
                    Updated:{" "}
                    {doc.updatedAt
                      ? formatDateTime({ d: doc.updatedAt, withTime: true })
                      : doc.createdAt
                        ? formatDateTime({ d: doc.createdAt, withTime: true })
                        : ""}
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-lg border border-gray-200 p-4 text-center text-gray-500">
                No documents yet.{" "}
                <Link
                  to={appRoutes("/docs/new")}
                  className="text-blue-600 hover:underline"
                >
                  Add your first document
                </Link>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Chats</h2>
            <Link
              to={appRoutes("/chats")}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentChats.length > 0 ? (
              recentChats.map((chat) => (
                <Link
                  key={chat.publicId}
                  to={appRoutes("/chats/:id", { id: chat.publicId })}
                  className="block rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                >
                  <h3 className="truncate font-medium">
                    {chat.messages.length > 0
                      ? chat.messages[0].text.slice(0, 60) +
                        (chat.messages[0].text.length > 60 ? "..." : "")
                      : "Empty chat"}
                  </h3>
                  <div className="mt-2 text-xs text-gray-400">
                    Updated:{" "}
                    {chat.updatedAt
                      ? formatDateTime({ d: chat.updatedAt, withTime: true })
                      : formatDateTime({ d: chat.createdAt, withTime: true })}
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-lg border border-gray-200 p-4 text-center text-gray-500">
                No chats yet.{" "}
                <Link
                  to={appRoutes("/chats/new")}
                  className="text-blue-600 hover:underline"
                >
                  Start your first chat
                </Link>
              </div>
            )}
          </div>
        </div>
      </div> */}
    </div>
  );
}

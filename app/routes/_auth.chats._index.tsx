import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import { requireInternalUser } from "~/.server/sessions/requireInternalUser";
import { Icon } from "~/components/Icon";
import { PageTitle } from "~/components/PageTitle";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import type { RouteData } from "~/types/routeData";
import { formatDateTime } from "~/utils/formatDateTime";

const SECTION_NAME = "Chats";

export const handle: RouteData = {
  pageTitle: SECTION_NAME,
};

export function meta() {
  return [
    { title: SECTION_NAME },
    // { content: "My Documents", name: "description" },
  ];
}

export async function loader(args: LoaderFunctionArgs) {
  const user = await requireInternalUser(args);

  const chats = await prisma.chat.findMany({
    include: {
      messages: true,
    },
    where: {
      ownerId: user.id,
    },
  });

  return {
    chats,
  };
}

export default function DocsList() {
  const { chats } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <PageTitle>{SECTION_NAME}</PageTitle>
        <Link to={appRoutes("/chats/new")} className="">
          <Icon name="ADD" label="New Chat" fontSize="38px" />
        </Link>
      </div>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {chats.map((c) => (
          <Link
            key={c.publicId}
            to={appRoutes("/docs/:id", { id: c.publicId })}
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
    </div>
  );
}

import type { LoaderFunctionArgs } from "react-router";
import {
  Form,
  Link,
  redirect,
  useLoaderData,
  useNavigation,
} from "react-router";
import { requireInternalUser } from "~/.server/sessions/requireInternalUser";
import { generateId } from "~/.server/utils/generateId";
import { requireRouteParam } from "~/.server/utils/requireRouteParam";
import { serverError } from "~/.server/utils/serverError";
import { PageTitle } from "~/components/page-title";
import { ActionButton } from "~/components/ui/ActionLink";
import { prisma } from "~/lib/prisma";
import { appRoutes } from "~/shared/appRoutes";
import { KEYS } from "~/shared/keys";
import type { RouteData } from "~/types/routeData";
import { formatDateTime } from "~/utils/formatDateTime";
import type { Route } from "./+types/_auth.docs.$id";

export const handle: RouteData = {
  pageTitle: "Doc Details",
};

export function meta({ data }: { data: { collection: { name: string } } }) {
  return [{ title: `Collection: ${data?.collection?.name || "Not Found"}` }];
}

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

  // todo: get chat with required public id AND filter by USER messages

  return { source };
}

export default function DocDetailsLayout() {
  const { source } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
        <PageTitle>Doc: {source.name ?? source.fileName}</PageTitle>
        <Form method="POST" className="">
          <ActionButton type="submit" disabled={navigation.state !== "idle"}>
            {navigation.state !== "idle" ? "Loading..." : "New Doc Chat"}
          </ActionButton>
        </Form>
      </div>

      <div className="">
        <p>Insert link to view doc - open in new tab</p>
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
    </div>
  );
}

export async function action(args: Route.ActionArgs) {
  const user = await requireInternalUser(args);
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
        ownerId: user.id,
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

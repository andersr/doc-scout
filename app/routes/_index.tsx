import { Link, useLoaderData } from "react-router";
import { getClientUser } from "~/.server/users/getClientUser";
import { requireUserPublicId } from "~/.server/users/getUserPublicId";
import { MainLayout } from "~/components/MainLayout";
import { appRoutes } from "~/shared/appRoutes";
import type { Route } from "./+types/_index";

export function meta() {
  return [{ title: "Dashboard" }, { name: "description", content: "" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const publicId = await requireUserPublicId({ request });
  // console.log("publicId: ", publicId);

  // if (!publicId) {
  //   throw redirect("/login");
  // }

  const currentUser = await getClientUser({ publicId });
  // const user = await requireUser({ request });

  // const existingIndexes = await pcClient.listIndexes();
  // console.log("existingIndexes: ", existingIndexes);

  // if (!publicId) {
  //   // throw await logout({ request });
  //   const cookie = await getSessionCookie({
  //     request,
  //   });
  //   // throw redirect(appRoutes("/login"), {
  //   //   headers: {
  //   //     "Set-Cookie": await authSessionStore.destroySession(cookie),
  //   //   },
  //   // });
  //   return redirect(appRoutes("/login"), {
  //     headers: {
  //       "Set-Cookie": await authSessionStore.destroySession(cookie),
  //     },
  //   });
  // }

  // const user = await prisma.user.findUnique({
  //   where: {
  //     publicId: publicId ?? "",
  //   },
  //   include: {
  //     projectMemberships: {
  //       include: {
  //         project: {
  //           include: {
  //             sources: true,
  //           },
  //         },
  //       },
  //     },
  //   },
  // });

  // if (!user) {
  //   // throw await logout({ request });
  //   const cookie = await getSessionCookie({
  //     request,
  //   });
  //   throw redirect(appRoutes("/login"), {
  //     headers: {
  //       "Set-Cookie": await authSessionStore.destroySession(cookie),
  //     },
  //   });
  // }

  return { currentUser };
}

export default function Dashboard() {
  const { currentUser } = useLoaderData<typeof loader>();

  return (
    <MainLayout currentUser={currentUser}>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      </div>
      <div className="mx-auto max-w-3xl">
        <h2 className="text-xl font-bold mb-6">Projects</h2>
        <Link className="border p-1 rounded" to={appRoutes("/projects/new")}>
          New Project
        </Link>
        <ul>
          {currentUser?.projectMemberships.map((p) => (
            <li key={p.project?.publicId}>
              {p.project?.publicId ? (
                <Link
                  to={appRoutes("/projects/:id", { id: p.project?.publicId })}
                >
                  {p.project?.name}
                </Link>
              ) : (
                <span>{p.project?.name} (no public id)</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </MainLayout>
  );
}

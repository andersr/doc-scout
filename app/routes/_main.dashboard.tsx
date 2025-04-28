import { prisma } from "~/.server/db";
import { requireUser } from "~/.server/sessions/requireUser";
import type { Route } from "./+types/_main.dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser({ request });
  try {
    const users = await prisma.user.findMany({});
    console.log(users);
    return { data: null };
  } catch (error) {
    console.error("error: ", error);
    return { data: null };
  }
}

export default function Dashboard() {
  return <div>DASHBOARD</div>;
}

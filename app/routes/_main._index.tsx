import { prisma } from "~/.server/db";
import type { Route } from "./+types/_main._index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const users = await prisma.user.findMany({});
    console.log(users);
    return { data: null };
  } catch (error) {
    console.error("error: ", error);
    return { data: null };
  }
}

export default function Home() {
  return <div>HOME</div>;
}

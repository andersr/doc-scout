import { PageTitle } from "~/components/PageTitle";

export function meta() {
  return [{ title: "Dashboard" }, { content: "", name: "description" }];
}

export default function Dashboard() {
  return (
    <>
      <div className="mx-auto max-w-3xl">
        <PageTitle>Dashboard</PageTitle>
      </div>
      <div className="">List recent updates</div>
    </>
  );
}

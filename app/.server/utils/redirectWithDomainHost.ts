import { redirect } from "react-router";
import { getDomainHost } from "./getDomainHost";

export default function ({
  request,
  route,
}: {
  request: Request;
  route: string;
}) {
  return redirect(`${getDomainHost({ request, withProtocol: true })}${route}`);
}

import { redirect } from "react-router";
import { appRoutes } from "~/shared/appRoutes";
import { getDomainHost } from "./getDomainHost";
import { isAllowedUser } from "./isAllowedUser";

export default function ({
  email,
  request,
}: {
  email: string;
  request: Request;
}) {
  const normalizedEmail = email.toLowerCase();

  const isAllowed = isAllowedUser(normalizedEmail);

  if (!isAllowed) {
    throw redirect(
      `${getDomainHost({ request, withProtocol: true })}${appRoutes(
        "/request-access",
        {
          email: normalizedEmail,
        },
      )}`,
    );
  }
}

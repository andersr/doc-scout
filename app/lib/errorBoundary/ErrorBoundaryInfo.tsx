import { PageTitle } from "~/components/PageTitle";
import { DEFAULT_MORE_HELP } from "~/config/errors";
import type { UseErrorBoundaryOutput } from "./types";

export function ErrorBoundaryInfo({
  details,
  message,
  stack,
}: UseErrorBoundaryOutput) {
  return (
    <>
      <PageTitle title={message} danger />
      <p>{details}</p>
      {stack ? (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      ) : (
        DEFAULT_MORE_HELP
      )}
    </>
  );
}

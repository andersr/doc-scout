import type { ActionFunctionArgs } from "react-router";
import { useActionData } from "react-router";
import { handleActionIntent } from "~/.server/actions/handleActionIntent";
import { newDocActions } from "~/.server/docs/newDocActions";
import { FileUploadForm } from "~/components/forms/FileUploadForm";
import { UrlForm } from "~/components/forms/UrlForm";
import { TabButton, TabContent, Tabs, TabsList } from "~/components/ui/tabs";
import { KEYS } from "~/shared/keys";
import type { RouteData } from "~/types/routeData";

const PAGE_TITLE = "Add Docs";

export const handle: RouteData = {
  pageTitle: PAGE_TITLE,
};

export function meta() {
  return [{ title: PAGE_TITLE }];
}

export default function NewDocsRoute() {
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{PAGE_TITLE}</h1>

      <Tabs defaultValue={KEYS.files}>
        <TabsList>
          <TabButton value={KEYS.files}>Files</TabButton>
          <TabButton value={KEYS.urls}>Via URL</TabButton>
        </TabsList>

        <TabContent value={KEYS.files}>
          <FileUploadForm />
        </TabContent>

        <TabContent value={KEYS.urls}>
          <UrlForm />
        </TabContent>
      </Tabs>
      {/* THIS NEEDS TO BE FIXED */}
      {/* {actionData?.errorMessage && (
        <div className="mt-4 text-center font-semibold text-red-400">
          {actionData.errorMessage}
        </div>
      )} */}
    </div>
  );
}

export async function action(args: ActionFunctionArgs) {
  return await handleActionIntent({
    handlers: newDocActions,
    request: args.request,
  });
}

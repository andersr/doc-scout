import type { ActionFunctionArgs } from "react-router";
import { useActionData } from "react-router";
import { handleActionIntent } from "~/.server/actions/handleActionIntent";
import { requireInternalUser } from "~/.server/sessions/requireInternalUser";
import { FileUploadForm } from "~/components/forms/FileUploadForm";
import { UrlForm } from "~/components/forms/UrlForm";
import {
  TabButton,
  TabContent,
  Tabs,
  TabsList,
  useTabs,
} from "~/components/ui/tabs";
import { KEYS } from "~/shared/keys";
import type { RouteData } from "~/types/routeData";
import { filesAction } from "./actions/filesAction";
import { urlsAction } from "./actions/urlsAction";

const PAGE_TITLE = "Add Docs";

export const handle: RouteData = {
  pageTitle: PAGE_TITLE,
};

export function meta() {
  return [{ title: PAGE_TITLE }];
}

export default function NewDocsRoute() {
  const actionData = useActionData<typeof action>();
  const { onValueChange, value } = useTabs({ defaultValue: KEYS.files });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{PAGE_TITLE}</h1>

      <Tabs value={value} onValueChange={onValueChange}>
        <TabsList>
          <TabButton
            value={KEYS.files}
            currentValue={value}
            onValueChange={onValueChange}
          >
            Files
          </TabButton>
          <TabButton
            value={KEYS.urls}
            currentValue={value}
            onValueChange={onValueChange}
          >
            Via URL
          </TabButton>
        </TabsList>

        <TabContent value={KEYS.files} currentValue={value}>
          <FileUploadForm />
        </TabContent>

        <TabContent value={KEYS.urls} currentValue={value}>
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
  await requireInternalUser(args);
  return await handleActionIntent({
    handlers: {
      files: filesAction,
      urls: urlsAction,
    },
    request: args.request,
  });
}

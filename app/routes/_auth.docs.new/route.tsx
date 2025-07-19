import { type ActionFunctionArgs, useActionData } from "react-router";
import { requireUser } from "~/.server/services/sessions/requireUser";
import { handleActionIntent } from "~/.server/utils/handleActionIntent";
import { FileUploadForm } from "~/components/files/FileUploadForm";
import { UrlForm } from "~/components/files/UrlForm";
import {
  TabButton,
  TabContent,
  Tabs,
  TabsList,
  useTabs,
} from "~/components/ui/tabs";
import { ADD_DOCS_TITLE } from "~/config/titles";
import { KEYS } from "~/shared/keys";
import type { RouteData } from "~/types/routes";
import { filesAction } from "./actions/filesAction";
import { urlsAction } from "./actions/urlsAction";

export const handle: RouteData = {
  addBackButton: true,
  pageTitle: ADD_DOCS_TITLE,
};

export default function NewDocsRoute() {
  const { currentTab, onTabChange } = useTabs({ defaultValue: KEYS.files });
  const actionData = useActionData<typeof action>();

  return (
    <>
      <div className="flex-1">
        <Tabs currentTab={currentTab} onTabChange={onTabChange}>
          <TabsList>
            <TabButton
              tabName={KEYS.files}
              currentTab={currentTab}
              onTabChange={onTabChange}
            >
              Files
            </TabButton>
            <TabButton
              tabName={KEYS.urls}
              currentTab={currentTab}
              onTabChange={onTabChange}
            >
              Via URL
            </TabButton>
          </TabsList>
          <TabContent tabName={KEYS.files} currentTab={currentTab}>
            <FileUploadForm />
          </TabContent>
          <TabContent tabName={KEYS.urls} currentTab={currentTab}>
            <UrlForm />
          </TabContent>
        </Tabs>
      </div>
      {actionData?.errors && (
        <ul className="text-danger mt-4 text-center font-semibold">
          {actionData?.errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}
    </>
  );
}

export async function action(args: ActionFunctionArgs) {
  await requireUser(args);
  return await handleActionIntent({
    handlers: {
      files: filesAction,
      urls: urlsAction,
    },
    ...args,
  });
}

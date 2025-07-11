import { type ActionFunctionArgs, useActionData } from "react-router";
import { requireUser } from "~/.server/services/sessions/requireUser";
import { handleActionIntent } from "~/.server/utils/handleActionIntent";
import { FileUploadForm } from "~/components/files/FileUploadForm";
import { UrlForm } from "~/components/files/UrlForm";
import { PageTitle } from "~/components/layout/PageTitle";
import {
  TabButton,
  TabContent,
  Tabs,
  TabsList,
  useTabs,
} from "~/components/ui/tabs";
import { ADD_DOCS_TITLE } from "~/config/titles";
import { KEYS } from "~/shared/keys";
import { filesAction } from "./actions/filesAction";
import { googleDriveAction } from "./actions/googleDriveAction";
import { urlsAction } from "./actions/urlsAction";

export default function NewDocsRoute() {
  const { onValueChange, value } = useTabs({ defaultValue: KEYS.files });
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <PageTitle title={ADD_DOCS_TITLE} />
      <div className="pt-4">
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
      </div>
      {actionData?.errors && (
        <ul className="text-danger mt-4 text-center font-semibold">
          {actionData?.errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export async function action(args: ActionFunctionArgs) {
  await requireUser(args);
  return await handleActionIntent({
    handlers: {
      files: filesAction,
      googleDrive: googleDriveAction,
      urls: urlsAction,
    },
    ...args,
  });
}

import { type ActionFunctionArgs, useActionData } from "react-router";
import { requireUser } from "~/.server/services/sessions/requireUser";
import { handleActionIntent } from "~/.server/utils/handleActionIntent";
import { FileUploadForm } from "~/components/forms/FileUploadForm";
import { UrlForm } from "~/components/forms/UrlForm";
import { PageTitle } from "~/components/PageTitle";
import {
  TabButton,
  TabContent,
  Tabs,
  TabsList,
  useTabs,
} from "~/components/ui/tabs";
import { KEYS } from "~/shared/keys";
import { createSourcesAction } from "./actions/createSourcesAction";
import { urlsAction } from "./actions/urlsAction";

export default function NewDocsRoute() {
  const { onValueChange, value } = useTabs({ defaultValue: KEYS.files });
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <PageTitle title="Add Docs" />
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
      {actionData?.errors && (
        <ul className="mt-4 text-center font-semibold text-red-400">
          {actionData?.errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}
    </div>
  );
}

export async function action(args: ActionFunctionArgs) {
  await requireUser(args);
  return await handleActionIntent({
    handlers: {
      createSources: createSourcesAction,
      urls: urlsAction,
    },
    request: args.request,
  });
}

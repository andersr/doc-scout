import { FileUploadForm } from "~/components/files/FileUploadForm";
import { UrlForm } from "~/components/files/UrlForm";
import {
  TabButton,
  TabContent,
  Tabs,
  TabsList,
  useTabs,
} from "~/components/ui/tabs";
import { KEYS } from "~/shared/keys";

export default function AddDocsTabs() {
  const { currentTab, onTabChange } = useTabs({ defaultValue: KEYS.files });

  return (
    <div className="pt-4">
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
  );
}

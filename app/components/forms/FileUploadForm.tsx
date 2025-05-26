import { Form, useNavigation } from "react-router";
import { FileUploader } from "~/components/file-uploader";
import { Button } from "~/components/ui/button";
import { useFileUpload } from "~/hooks/useFileUpload";
import { PARAMS } from "~/shared/params";

export function FileUploadForm() {
  const navigation = useNavigation();

  const fileUploader = useFileUpload({
    inputId: "file_list",
  });

  const filesSubmitDisabled =
    navigation.state !== "idle" || fileUploader.selectedFiles.length === 0;

  return (
    <Form
      method="POST"
      encType="multipart/form-data"
      className="flex flex-col gap-6"
    >
      <input type="hidden" name={PARAMS.INTENT} value={PARAMS.FILES} />

      <div className="flex flex-col gap-2">
        <FileUploader
          {...fileUploader}
          label="Upload Files"
          placeholder="Drag and drop files here, or click to select files"
        />
      </div>

      <Button type="submit" disabled={filesSubmitDisabled}>
        {navigation.state === "submitting" ? "Processing..." : "Continue"}
      </Button>
    </Form>
  );
}

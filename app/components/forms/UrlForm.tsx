import { useState } from "react";
import { Form, useNavigation } from "react-router";
import { KEYS } from "~/shared/keys";
import { isValidUrl } from "~/utils/isValidUrl";
import { splitCsvText } from "~/utils/splitCsvText";
import { ActionButton } from "../ui/ActionButton";
import { Textarea } from "../ui/textarea";

export function UrlForm() {
  const navigation = useNavigation();
  const [urlInput, setUrlInput] = useState("");
  const [validationError, setValidationError] = useState("");

  const hasValidUrls = urlInput.trim().length > 0;

  const handleUrlBlur = () => {
    if (!urlInput.trim()) {
      setValidationError("");
      return;
    }

    const urls = splitCsvText(urlInput);
    const invalidUrls = urls.filter((url) => !isValidUrl(url));
    const invalidUrlError = `Invalid URL${invalidUrls.length > 1 ? "s" : ""}: ${invalidUrls.join(", ")}`;
    const error = invalidUrls.length > 0 ? invalidUrlError : "";

    setValidationError(error);
  };

  const handleUrlChange = (value: string) => {
    setUrlInput(value);
    if (validationError) {
      setValidationError("");
    }
  };

  return (
    <Form method="POST" className="flex flex-col gap-6">
      <input type="hidden" name={KEYS.intent} value={KEYS.urls} />
      <div className="flex flex-col gap-2">
        <label htmlFor={KEYS.urls} className="text-sm font-medium">
          URLs
        </label>
        <Textarea
          id={KEYS.urls}
          name={KEYS.urls}
          value={urlInput}
          onChange={(e) => handleUrlChange(e.target.value)}
          onBlur={handleUrlBlur}
          placeholder="https://example.com/doc1&#10;https://example.com/doc2"
          rows={6}
          required
          aria-invalid={!!validationError}
          aria-describedby={validationError ? KEYS.error : KEYS.description}
        />
        {validationError && (
          <div id={KEYS.error} className="text-danger py-2" role="alert">
            {validationError}
          </div>
        )}
        <p id={KEYS.description} className="text-sm">
          Enter URLs one per line or comma-separated.
        </p>
      </div>
      <div>
        <ActionButton
          type="submit"
          disabled={
            navigation.state !== "idle" || !hasValidUrls || !!validationError
          }
        >
          {navigation.state === "submitting" ? "Processing..." : "Continue"}
        </ActionButton>
      </div>
    </Form>
  );
}

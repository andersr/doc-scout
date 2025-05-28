import { Form, useNavigation } from "react-router";
import { Button } from "~/components/ui/button";
import { KEYS } from "~/shared/keys";
import { Textarea } from "../ui/textarea";

export function UrlForm() {
  const navigation = useNavigation();

  return (
    <Form method="POST" className="flex flex-col gap-6">
      <input type="hidden" name={KEYS.intent} value={KEYS.urls} />

      <div className="flex flex-col gap-2">
        <label htmlFor="urls" className="text-sm font-medium">
          URLs
        </label>
        <Textarea
          id="urls"
          name={KEYS.urls}
          placeholder="Enter URLs, one per line or comma-separated&#10;https://example.com/doc1&#10;https://example.com/doc2"
          rows={6}
          required
        />
        <p className="text-muted-foreground text-sm">
          Enter URLs one per line or comma-separated
        </p>
      </div>

      <Button type="submit" disabled={navigation.state !== "idle"}>
        {navigation.state === "submitting" ? "Processing..." : "Continue"}
      </Button>
    </Form>
  );
}

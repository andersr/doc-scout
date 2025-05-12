import { zodResolver } from "@hookform/resolvers/zod";
import { Form, useNavigation } from "react-router";
import { useRemixForm } from "remix-hook-form";
import type { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { loginSchema } from "~/lib/formSchemas";
import { INTENTS, PARAMS } from "~/shared/params";

export type LoginFormData = z.infer<typeof loginSchema>;
export const loginResolver = zodResolver(loginSchema);

export function LoginForm() {
  const pendingUI = useNavigation();

  const {
    handleSubmit,
    formState: { errors, isValid },
    register,
  } = useRemixForm<LoginFormData>({
    mode: "onSubmit",
    resolver: loginResolver,
    stringifyAllValues: false,
  });

  return (
    <Form onSubmit={handleSubmit} method="POST">
      <div className="mb-2">
        <Label className="pb-2">Email</Label>
        <Input
          type="email"
          {...register("email")}
          placeholder="name@example.com"
        />
        {errors.email && <p>{errors.email.message}</p>}
      </div>
      <Button
        type="submit"
        {...register("intent")}
        disabled={!isValid}
        name={PARAMS.INTENT}
        value={INTENTS.LOGIN}
      >
        {pendingUI.state !== "idle" ? "Sending..." : "Continue"}
      </Button>
    </Form>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { Form, useNavigation } from "react-router";
import { useRemixForm } from "remix-hook-form";
import type { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { otpSchema } from "~/lib/formSchemas";
import { INTENTS, PARAMS } from "~/shared/params";

export type OtpFormData = z.infer<typeof otpSchema>;
export const otpResolver = zodResolver(otpSchema);

export function OtpForm({ email }: { email: string }) {
  const pendingUI = useNavigation();

  const {
    handleSubmit,
    formState: { errors },
    register,
    watch,
  } = useRemixForm<OtpFormData>({
    mode: "onSubmit",
    resolver: otpResolver,
    stringifyAllValues: false,
    submitData: {
      email,
    },
  });

  const otpValue = watch("otp", "");

  return (
    <Form onSubmit={handleSubmit} method="POST">
      <div className="mb-2">
        <Label className="pb-2">Email</Label>
        <Input type="text" {...register("otp")} placeholder="code" />
        {/* <input type="hidden" {...register("email")} readOnly value={email} /> */}
        {errors.otp && <p>{errors.otp.message}</p>}
      </div>
      <Button
        type="submit"
        disabled={otpValue.trim() === ""}
        name={PARAMS.INTENT}
        value={INTENTS.OTP}
      >
        {pendingUI.state !== "idle" ? "Verifying..." : "Verify"}
      </Button>
    </Form>
  );
}

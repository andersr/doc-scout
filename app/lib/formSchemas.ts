import { z } from "zod";
import { INTENTS } from "~/shared/params";

export const loginSchema = z.object({
  intent: z.literal(INTENTS.LOGIN),
  email: z.string().email(),
});

export const otpSchema = z.object({
  intent: z.literal(INTENTS.OTP),
  otp: z.string().min(6).max(6),
  email: z.string().email(),
});

export const newProjectSchema = z.object({
  name: z.string().min(1),
});

export const playgroundSchema = z.object({
  question: z.string().min(1),
});

import type { Project } from "@prisma/client";

export interface ApiResponse {
  ok: boolean;
  errorMessage?: string;
  successMessage?: string;
  data: Project | null;
}

export class APIError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
  }
}

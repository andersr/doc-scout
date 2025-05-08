import type { ProjectClient } from "./project";

export interface ApiResponse {
  ok: boolean;
  errorMessage?: string;
  successMessage?: string;
  data: ProjectClient | null;
}

export class APIError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
  }
}

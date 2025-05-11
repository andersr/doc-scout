import type { ProjectClient } from "./project";

// for now - use zod schema
interface QueryResponse {
  answer: string;
}

export interface ApiResponse {
  ok: boolean;
  errorMessage?: string; // LEGACY
  errors: null; // for now
  successMessage?: string; // LEGACY
  data: ProjectClient | QueryResponse | null;
}

export class APIError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
  }
}

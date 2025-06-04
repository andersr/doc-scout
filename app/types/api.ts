import type { ProjectClient } from "./project";

// for now - use zod schema
interface QueryResponse {
  answer: string;
}

// TODO: outdated
export interface ApiResponse {
  data: ProjectClient | QueryResponse | null;
  errorMessage?: string; // LEGACY
  errors: null; // for now
  ok: boolean; // LEGACY
  successMessage?: string;
}

export class APIError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
  }
}

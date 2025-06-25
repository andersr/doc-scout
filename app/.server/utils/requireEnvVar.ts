export function requireEnvVar(key: string): string {
  const val = process.env[key];

  if (!val) {
    throw new Error(`Missing env var for ${key}`);
  }

  return val;
}

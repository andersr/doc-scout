export default async function ({ request }: { request: Request }) {
  return Object.fromEntries(await request.formData());
}

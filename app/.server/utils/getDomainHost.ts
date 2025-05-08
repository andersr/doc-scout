// src: epic stack
export function getDomainHost({
  request,
  withProtocol,
}: {
  request: Request;
  withProtocol?: boolean;
}) {
  const host =
    request.headers.get("X-Forwarded-Host") ??
    request.headers.get("host") ??
    new URL(request.url).host;
  if (withProtocol) {
    const protocol = host.includes("localhost") ? "http" : "https";
    return `${protocol}://${host}`;
  }
  return host;
}

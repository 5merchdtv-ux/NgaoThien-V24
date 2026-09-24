export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    const forwardedHost =
      request.headers.get("x-forwarded-host") ??
      request.headers.get("host") ??
      requestUrl.host;
    const forwardedProtocol =
      request.headers.get("x-forwarded-proto") ?? requestUrl.protocol.slice(0, -1);

    return (
      originUrl.host === forwardedHost &&
      originUrl.protocol === `${forwardedProtocol}:`
    );
  } catch {
    return false;
  }
}

export function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function cleanMultilineText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
    .slice(0, maxLength);
}

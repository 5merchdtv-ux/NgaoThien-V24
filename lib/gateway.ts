import "server-only";

export function gatewayBaseUrl(): string {
  return (
    process.env.API_BASE_URL ?? "https://hkngaothien.duckdns.org"
  ).replace(/\/+$/, "");
}

export function gatewayHeaders(
  values: Record<string, string> = {},
): Headers {
  const secret = process.env.GATEWAY_API_SECRET?.trim() ?? "";
  if (secret.length < 32) {
    throw new Error("GATEWAY_API_SECRET must contain at least 32 characters.");
  }

  const headers = new Headers(values);
  headers.set("X-HKNT-Gateway-Key", secret);
  return headers;
}

export function normalizeGatewayPayload<T>(value: T): T {
  function normalize(input: unknown): unknown {
    if (Array.isArray(input)) {
      return input.map(normalize);
    }
    if (input && typeof input === "object") {
      return Object.fromEntries(
        Object.entries(input).map(([key, item]) => [
          key ? key[0].toLowerCase() + key.slice(1) : key,
          normalize(item),
        ]),
      );
    }
    return input;
  }

  return normalize(value) as T;
}

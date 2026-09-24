import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { cookies } from "next/headers";

export const GM_SESSION_COOKIE = "hknt_gm_session";

export type GmSession = {
  accountId: string;
  displayName?: string;
  token: string;
  role: number;
  exp: number;
};

function encryptionKey(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  }
  return createHash("sha256").update(`${secret}:gm-session:v1`).digest();
}

export function encryptGmSession(session: GmSession): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(session), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted]
    .map((part) => part.toString("base64url"))
    .join(".");
}

export function decryptGmSession(value?: string): GmSession | null {
  if (!value) return null;

  try {
    const [ivText, tagText, encryptedText, ...extra] = value.split(".");
    if (!ivText || !tagText || !encryptedText || extra.length > 0) return null;

    const decipher = createDecipheriv(
      "aes-256-gcm",
      encryptionKey(),
      Buffer.from(ivText, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tagText, "base64url"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedText, "base64url")),
      decipher.final(),
    ]);
    const session = JSON.parse(decrypted.toString("utf8")) as GmSession;

    if (
      !session.accountId ||
      !session.token ||
      !Number.isInteger(session.role) ||
      session.role < 6 ||
      !Number.isFinite(session.exp) ||
      session.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function getGmSession(): Promise<GmSession | null> {
  const cookieStore = await cookies();
  return decryptGmSession(cookieStore.get(GM_SESSION_COOKIE)?.value);
}

export const gmSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

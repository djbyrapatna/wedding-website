import "server-only";
import {
  createHmac,
  timingSafeEqual,
  createHash,
  randomBytes,
} from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "wedding-invitation";
const MAX_AGE = 60 * 60 * 2;
export function invitationConfigured() {
  return (process.env.INVITATION_SESSION_SECRET?.length ?? 0) >= 32;
}
function signature(value: string) {
  if (!invitationConfigured())
    throw new Error("Invitation sessions are not configured.");
  return createHmac("sha256", process.env.INVITATION_SESSION_SECRET!)
    .update(value)
    .digest("base64url");
}
export function openInvitation(householdId: number) {
  const value = Buffer.from(
    JSON.stringify({
      household_id: householdId,
      expires: Date.now() + MAX_AGE * 1000,
    }),
  ).toString("base64url");
  cookies().set(COOKIE, `${value}.${signature(value)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}
export function invitationHousehold(): number | null {
  if (!invitationConfigured()) return null;
  const token = cookies().get(COOKIE)?.value;
  if (!token || token.length > 1024) return null;
  const [value, supplied, extra] = token.split(".");
  if (!value || !supplied || extra || !/^[A-Za-z0-9_-]{43}$/.test(supplied))
    return null;
  const expected = signature(value);
  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))
  )
    return null;
  try {
    const payload = JSON.parse(Buffer.from(value, "base64url").toString());
    return Number.isInteger(payload.household_id) &&
      Number.isFinite(payload.expires) &&
      payload.expires > Date.now()
      ? payload.household_id
      : null;
  } catch {
    return null;
  }
}
export const generateInvitationCode = () =>
  `WED-${randomBytes(10).toString("hex").toUpperCase()}`;
export const normalizeInvitationCode = (code: string) =>
  code.trim().toUpperCase();
export const invitationCodeHash = (code: string) =>
  createHash("sha256").update(normalizeInvitationCode(code)).digest("hex");

import { env } from "cloudflare:workers";

const SESSION_COOKIE = "hfg_session";
const SESSION_SECONDS = 60 * 60 * 24 * 30;
const PASSWORD_ITERATIONS = 310_000;
const DUMMY_PASSWORD_SALT = "00000000000000000000000000000000";
const DUMMY_PASSWORD_HASH = "0000000000000000000000000000000000000000000000000000000000000000";
const encoder = new TextEncoder();

type Bindings = {
  DB: D1Database;
  SESSION_SECRET: string;
};

type GroupCredentials = {
  id: number;
  password_salt: string;
  password_hash: string;
  password_iterations: number;
};

const bindings = env as unknown as Bindings;

function hexToBytes(hex: string) {
  if (!/^(?:[0-9a-f]{2})+$/.test(hex)) {
    throw new Error("Invalid hexadecimal value");
  }

  return Uint8Array.from(hex.match(/.{2}/g)!, (byte) => Number.parseInt(byte, 16));
}

function bytesToHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sessionKey() {
  const secret = encoder.encode(bindings.SESSION_SECRET);

  if (secret.byteLength < 32) {
    throw new Error("SESSION_SECRET must be at least 32 UTF-8 bytes");
  }

  return crypto.subtle.importKey("raw", secret, { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

async function sign(payload: string) {
  return bytesToHex(await crypto.subtle.sign("HMAC", await sessionKey(), encoder.encode(payload)));
}

function sessionCookieValue(input: Request | string) {
  const cookies = typeof input === "string" ? input : (input.headers.get("cookie") ?? "");
  const prefix = `${SESSION_COOKIE}=`;

  return cookies
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(prefix))
    ?.slice(prefix.length);
}

function secureAttribute(request: Request) {
  return new URL(request.url).protocol === "https:" ? "; Secure" : "";
}

export async function verifyGroupPassword(group: string, password: string) {
  const credentials = await bindings.DB.prepare(
    `SELECT id, password_salt, password_hash, password_iterations
     FROM groups
     WHERE slug = ?`,
  )
    .bind(group.trim().toLowerCase())
    .first<GroupCredentials>();

  const passwordSalt = credentials?.password_salt ?? DUMMY_PASSWORD_SALT;
  const passwordHash = credentials?.password_hash ?? DUMMY_PASSWORD_HASH;
  const passwordIterations = credentials?.password_iterations ?? PASSWORD_ITERATIONS;
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const actual = new Uint8Array(
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        hash: "SHA-256",
        salt: hexToBytes(passwordSalt),
        iterations: passwordIterations,
      },
      key,
      256,
    ),
  );
  const expected = hexToBytes(passwordHash);

  if (expected.length !== actual.length) {
    throw new Error("Invalid group password hash");
  }

  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) {
    difference |= actual[index] ^ expected[index];
  }

  return difference === 0 ? (credentials?.id ?? null) : null;
}

export async function getSessionGroupId(input: Request | string) {
  const value = sessionCookieValue(input);
  const match = value?.match(/^(\d+)\.(\d+)\.([0-9a-f]{64})$/);

  if (!match) {
    return null;
  }

  const [, groupId, expires, signature] = match;
  if (Number(expires) <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  const payload = `${groupId}.${expires}`;
  const valid = await crypto.subtle.verify(
    "HMAC",
    await sessionKey(),
    hexToBytes(signature),
    encoder.encode(payload),
  );

  return valid ? Number(groupId) : null;
}

export async function requireSessionGroupId(input: Request | string) {
  const groupId = await getSessionGroupId(input);

  if (groupId === null) {
    throw new Error("Authentication required");
  }

  return groupId;
}

export async function buildLoginCookie(groupId: number, request: Request) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `${groupId}.${expires}`;
  const value = `${payload}.${await sign(payload)}`;

  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_SECONDS}; Expires=${new Date(expires * 1000).toUTCString()}${secureAttribute(request)}`;
}

export function buildLogoutCookie(request: Request) {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secureAttribute(request)}`;
}

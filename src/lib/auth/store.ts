import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: string;
};

export type PublicAuthUser = Omit<AuthUser, "passwordHash">;

const storeDir = path.join(os.tmpdir(), "ai-job-application-auth");
const storeFile = path.join(storeDir, "users.json");

async function ensureStore(): Promise<void> {
  await fs.mkdir(storeDir, { recursive: true });

  try {
    await fs.access(storeFile);
  } catch {
    await fs.writeFile(storeFile, JSON.stringify({ users: [] }, null, 2), "utf8");
  }
}

async function readStore(): Promise<{ users: AuthUser[] }> {
  await ensureStore();

  const raw = await fs.readFile(storeFile, "utf8");

  try {
    const parsed = JSON.parse(raw) as { users?: AuthUser[] };
    return { users: Array.isArray(parsed.users) ? parsed.users : [] };
  } catch {
    return { users: [] };
  }
}

async function writeStore(users: AuthUser[]): Promise<void> {
  await ensureStore();
  await fs.writeFile(storeFile, JSON.stringify({ users }, null, 2), "utf8");
}

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function sanitizeUser(user: AuthUser): PublicAuthUser {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function registerUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}): Promise<PublicAuthUser> {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const email = input.email.trim().toLowerCase();
  const username = input.username.trim();
  const password = input.password.trim();

  if (!firstName || !lastName || !email || !username || !password) {
    throw new Error("All profile fields are required.");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const store = await readStore();
  const exists = store.users.some(
    (user) => user.email.toLowerCase() === email || user.username.toLowerCase() === username.toLowerCase(),
  );

  if (exists) {
    throw new Error("An account with that email or username already exists.");
  }

  const user: AuthUser = {
    id: crypto.randomUUID(),
    firstName,
    lastName,
    email,
    username,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  store.users.push(user);
  await writeStore(store.users);

  return sanitizeUser(user);
}

export async function loginUser(input: {
  identifier: string;
  password: string;
}): Promise<PublicAuthUser | null> {
  const identifier = input.identifier.trim().toLowerCase();
  const password = input.password.trim();

  if (!identifier || !password) {
    return null;
  }

  const store = await readStore();
  const user = store.users.find(
    (entry) =>
      entry.email.toLowerCase() === identifier ||
      entry.username.toLowerCase() === identifier,
  );

  if (!user) {
    return null;
  }

  if (user.passwordHash !== hashPassword(password)) {
    return null;
  }

  return sanitizeUser(user);
}

export async function getUserById(userId: string): Promise<PublicAuthUser | null> {
  const store = await readStore();
  const user = store.users.find((entry) => entry.id === userId);
  return user ? sanitizeUser(user) : null;
}

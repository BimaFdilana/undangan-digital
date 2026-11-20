"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { rateLimit } from "@/lib/ratelimit";
import { createSession, destroySession } from "@/lib/session";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

// hash tiruan agar waktu respons sama untuk email yang tak ada
const DUMMY = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8.gP0rXr2G7sQ8w3b3e4kYh9tYb0We";

export type LoginState = { error?: string };

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const parsed = schema.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { error: "Email atau kata sandi tidak valid." };
  const { email, password } = parsed.data;

  if (!rateLimit(`login:${ip}`, 20, 10 * 60_000) || !rateLimit(`login:${email}`, 8, 10 * 60_000)) {
    return { error: "Terlalu banyak percobaan. Coba lagi beberapa menit lagi." };
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY);
  if (!user || !ok) return { error: "Email atau kata sandi salah." };

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

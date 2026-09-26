"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { getAdminCredentials } from "@/lib/env";

export type LoginState = {
  error: string;
} | null;

export async function login(_state: LoginState, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const admin = getAdminCredentials();

  if (!admin) {
    return { error: "Login is not set up yet." };
  }

  if (email !== admin.email || password !== admin.password) {
    return { error: "Wrong email or password." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "admin", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}

"use client";

import { useActionState } from "react";
import { login } from "@/lib/auth/actions";

type LoginFormProps = {
  siteName: string;
};

export function LoginForm({ siteName }: LoginFormProps) {
  const [state, action, pending] = useActionState(login, null);

  return (
    <main className="flex min-h-full items-center justify-center px-6 py-12">
      <form
        action={action}
        className="w-full max-w-md space-y-5 rounded-2xl border border-zinc-200 bg-white p-8"
      >
        <header className="space-y-1 text-center">
          <p className="font-hand text-4xl font-bold">{siteName}</p>
          <h1 className="text-xl font-semibold tracking-tight">Log in</h1>
          <p className="text-sm text-zinc-500">
            Enter your admin email and password.
          </p>
        </header>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            className="h-11 rounded-xl border border-zinc-200 px-3 text-zinc-900 outline-none focus:border-emerald-500"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-600">
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="h-11 rounded-xl border border-zinc-200 px-3 text-zinc-900 outline-none focus:border-emerald-500"
          />
        </label>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="h-11 w-full rounded-xl bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {pending ? "Logging in..." : "Log in"}
        </button>
      </form>
    </main>
  );
}

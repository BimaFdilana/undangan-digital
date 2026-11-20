"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm text-stone-600">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:border-emerald-700"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-stone-600">Kata sandi</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 outline-none focus:border-emerald-700"
        />
      </label>
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <button
        disabled={pending}
        className="w-full rounded-lg bg-emerald-800 py-2.5 font-medium text-white hover:bg-emerald-900 disabled:opacity-60"
      >
        {pending ? "Masuk…" : "Masuk"}
      </button>
    </form>
  );
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "Masuk — Undangan" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
        <h1 className="mb-1 text-2xl font-semibold text-stone-900">Masuk</h1>
        <p className="mb-6 text-sm text-stone-500">Kelola undangan pernikahan Anda.</p>
        <LoginForm />
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    identifier: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "login"
            ? {
                identifier: form.identifier,
                password: form.password,
              }
            : {
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                username: form.username,
                password: form.password,
              },
        ),
      });

      const data = (await response.json()) as { error?: string; user?: { firstName: string; lastName: string } };

      if (!response.ok || !data.user) {
        throw new Error(data.error ?? "Authentication failed.");
      }

      router.push("/");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Access</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {mode === "login" ? "Sign in" : "Create account"}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setMode((current) => (current === "login" ? "register" : "login"))}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700"
          >
            {mode === "login" ? "Need an account?" : "Have an account?"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>First name</span>
                  <input
                    value={form.firstName}
                    onChange={(event) => handleChange("firstName", event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:border-sky-500 focus:outline-none"
                    required
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Last name</span>
                  <input
                    value={form.lastName}
                    onChange={(event) => handleChange("lastName", event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:border-sky-500 focus:outline-none"
                    required
                  />
                </label>
              </div>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:border-sky-500 focus:outline-none"
                  required
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Username</span>
                <input
                  value={form.username}
                  onChange={(event) => handleChange("username", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:border-sky-500 focus:outline-none"
                  required
                />
              </label>
            </>
          ) : (
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Email or username</span>
              <input
                value={form.identifier}
                onChange={(event) => handleChange("identifier", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:border-sky-500 focus:outline-none"
                required
              />
            </label>
          )}

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => handleChange("password", event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:border-sky-500 focus:outline-none"
              required
            />
          </label>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          <Link href="/" className="font-medium text-sky-700 hover:text-sky-800">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}

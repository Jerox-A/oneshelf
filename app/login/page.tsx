"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setMessage("");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      setLoading(false);

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Account created. Check your email if Supabase asks for confirmation.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-emerald-300">OneShelf</p>

          <h1 className="mt-2 text-3xl font-bold">
            {mode === "login" ? "Log in" : "Create account"}
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Access your shop dashboard, products, customers, and sales.
          </p>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-300">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-12 rounded-2xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-emerald-400"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-300">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                className="h-12 rounded-2xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-emerald-400"
              />
            </label>

            {message ? (
              <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-300">
                {message}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !email || !password}
              className="h-12 rounded-2xl bg-emerald-400 font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Log in"
                  : "Create account"}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setMessage("");
              }}
              className="text-sm text-emerald-300 underline"
            >
              {mode === "login"
                ? "Need an account? Create one"
                : "Already have an account? Log in"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
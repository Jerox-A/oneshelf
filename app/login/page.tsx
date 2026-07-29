"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
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

    if (!email.trim()) {
      setLoading(false);
      setMessage("Email is required.");
      return;
    }

    if (!password) {
      setLoading(false);
      setMessage("Password is required.");
      return;
    }

    if (mode === "signup" && password.length < 6) {
      setLoading(false);
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      setLoading(false);

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage(
        "Account created. Check your email if Supabase asks for confirmation."
      );
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
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
    <main className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-6xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-8">
        <section className="hidden lg:block">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
              <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
              OneShelf
            </div>

            <h1 className="mt-6 text-5xl font-bold tracking-tight">
              Run your shop from one clean workspace.
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Track inventory, customers, sales, payments, receipts, reports,
              and exports without spreadsheets getting messy.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-2xl">📦</p>
                <p className="mt-3 font-semibold">Inventory</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Products, stock levels, pricing, and low-stock alerts.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-2xl">🧾</p>
                <p className="mt-3 font-semibold">Sales</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Record sales, print receipts, and handle walk-in customers.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-2xl">👥</p>
                <p className="mt-3 font-semibold">Customers</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Track balances, payments, and customer records.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-2xl">📊</p>
                <p className="mt-3 font-semibold">Reports</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  See sales, profit, unpaid balances, and best sellers.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-[calc(100vh-3rem)] items-center lg:min-h-0">
          <div className="w-full rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
                  <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                  OneShelf
                </div>

                <h2 className="mt-5 text-3xl font-bold tracking-tight">
                  {mode === "login" ? "Welcome back" : "Create account"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {mode === "login"
                    ? "Log in to access your shop dashboard."
                    : "Create an account to start managing your shop."}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-1 shadow-inner dark:bg-slate-950">
                <ThemeToggle />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 rounded-2xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setMessage("");
                }}
                className={
                  mode === "login"
                    ? "h-10 rounded-xl bg-white text-sm font-semibold text-slate-950 shadow-sm dark:bg-slate-900 dark:text-slate-100"
                    : "h-10 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-100"
                }
              >
                Log in
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setMessage("");
                }}
                className={
                  mode === "signup"
                    ? "h-10 rounded-xl bg-white text-sm font-semibold text-slate-950 shadow-sm dark:bg-slate-900 dark:text-slate-100"
                    : "h-10 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-100"
                }
              >
                Sign up
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>

              {message ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                  {message}
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !email.trim() || !password}
                className="h-12 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Please wait..."
                  : mode === "login"
                    ? "Log in"
                    : "Create account"}
              </button>

              <p className="text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
                Your products, customers, sales, reports, and exports are saved
                securely to your account.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
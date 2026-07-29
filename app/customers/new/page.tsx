"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppNav from "@/components/AppNav";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/lib/supabase";

export default function NewCustomerPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [balanceOwed, setBalanceOwed] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const balanceNumber = Number(balanceOwed) || 0;

  function formatMoney(amount: number) {
    return `$${Number(amount || 0).toLocaleString()}`;
  }

  async function handleSaveCustomer() {
    setSaving(true);
    setErrorMessage("");

    if (!name.trim()) {
      setSaving(false);
      setErrorMessage("Customer name is required.");
      return;
    }

    const { error } = await supabase.from("customers").insert({
      name: name.trim(),
      phone: phone.trim() || null,
      balance_owed: balanceNumber,
      last_purchase_at: balanceNumber > 0 ? new Date().toISOString() : null,
    });

    setSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/customers");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
                <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                OneShelf
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Add customer
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Save a customer record, add a phone number, and track any
                starting balance they owe.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-inner dark:border-slate-800 dark:bg-slate-950">
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-xl bg-white p-1 shadow-sm dark:bg-slate-900">
                  <ThemeToggle />
                </div>

                <div className="rounded-xl bg-white p-1 shadow-sm dark:bg-slate-900">
                  <LogoutButton />
                </div>

                <a
                  href="/customers"
                  className="flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Customers
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <AppNav />
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div>
              <h2 className="text-lg font-semibold">Customer details</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Enter the customer name, phone number, and optional starting
                balance.
              </p>
            </div>

            <div className="mt-6 grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Customer name
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Example: Sarah Adams"
                  className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Phone number
                </span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Example: +233 24 000 4444"
                  className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Starting balance owed
                </span>
                <input
                  type="number"
                  min="0"
                  value={balanceOwed}
                  onChange={(event) => setBalanceOwed(event.target.value)}
                  placeholder="Example: 0"
                  className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Use 0 when the customer does not owe anything yet.
                </p>
              </label>

              {errorMessage ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                  {errorMessage}
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleSaveCustomer}
                disabled={saving || !name.trim()}
                className="h-12 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving customer..." : "Save customer"}
              </button>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:sticky lg:top-6 lg:self-start">
            <h2 className="text-lg font-semibold">Customer summary</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review before saving.
            </p>

            <div className="mt-6 grid gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Customer
                </p>
                <p className="mt-1 font-semibold">
                  {name.trim() || "Not entered"}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {phone.trim() || "No phone number"}
                </p>
              </div>

              <div
                className={
                  balanceNumber > 0
                    ? "rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950"
                    : "rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950"
                }
              >
                <p
                  className={
                    balanceNumber > 0
                      ? "text-sm text-amber-700 dark:text-amber-300"
                      : "text-sm text-emerald-700 dark:text-emerald-300"
                  }
                >
                  Balance owed
                </p>
                <p
                  className={
                    balanceNumber > 0
                      ? "mt-1 text-3xl font-bold text-amber-800 dark:text-amber-200"
                      : "mt-1 text-3xl font-bold text-emerald-800 dark:text-emerald-200"
                  }
                >
                  {formatMoney(balanceNumber)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Tip
                </p>
                <p className="mt-1 text-sm font-medium text-blue-900 dark:text-blue-100">
                  You can also use Customer / Walk-in on the New Sale page when
                  you do not know the customer name.
                </p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
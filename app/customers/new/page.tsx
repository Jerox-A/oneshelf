"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

export default function NewCustomerPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [balanceOwed, setBalanceOwed] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSaveCustomer() {
    setSaving(true);
    setErrorMessage("");

    const { error } = await supabase.from("customers").insert({
      name,
      phone,
      balance_owed: Number(balanceOwed) || 0,
      last_purchase_at: new Date().toISOString(),
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
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <header className="border-b border-slate-800 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-emerald-300">OneShelf</p>
              <h1 className="mt-1 text-3xl font-bold">Add customer</h1>
              <p className="mt-2 text-sm text-slate-400">
                Add a customer and track how much they owe.
              </p>
            </div>

            <a
              href="/customers"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200"
            >
              Back to customers
            </a>
          </div>

          <AppNav />
        </header>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-300">
                Customer name
              </span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Example: Sarah Adams"
                className="h-12 rounded-2xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-emerald-400"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-300">
                Phone number
              </span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Example: +233 24 000 4444"
                className="h-12 rounded-2xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-emerald-400"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-300">
                Balance owed
              </span>
              <input
                type="number"
                value={balanceOwed}
                onChange={(event) => setBalanceOwed(event.target.value)}
                placeholder="Example: 0"
                className="h-12 rounded-2xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-emerald-400"
              />
            </label>

            {errorMessage ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleSaveCustomer}
              disabled={saving || !name}
              className="h-12 rounded-2xl bg-emerald-400 font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save customer"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
"use client";

import AppNav from "@/components/AppNav";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Customer = {
  id: string;
  name: string;
  phone: string | null;
  balance_owed: number;
};

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();

  const customerId = String(params.id);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [balanceOwed, setBalanceOwed] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadCustomer() {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, phone, balance_owed")
        .eq("id", customerId)
        .single();

      if (error || !data) {
        setMessage(error?.message || "Customer not found.");
        setLoading(false);
        return;
      }

      const customer = data as Customer;

      setName(customer.name);
      setPhone(customer.phone || "");
      setBalanceOwed(Number(customer.balance_owed || 0));
      setLoading(false);
    }

    loadCustomer();
  }, [customerId]);

  async function handleSave() {
    setMessage("");

    if (!name.trim()) {
      setMessage("Customer name is required.");
      return;
    }

    if (balanceOwed < 0) {
      setMessage("Balance owed cannot be negative.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("customers")
      .update({
        name,
        phone: phone || null,
        balance_owed: balanceOwed,
      })
      .eq("id", customerId);

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/customers");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <header className="border-b border-slate-200 pb-6 dark:border-slate-800">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                OneShelf
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Edit customer
              </h1>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Update customer details, phone number, and balance owed.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle />
              <LogoutButton />

              <a
                href="/customers"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Back to customers
              </a>
            </div>
          </div>

          <AppNav />
        </header>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading customer...
            </p>
          ) : (
            <div className="grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Customer name
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Phone
                </span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Optional phone number"
                  className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Balance owed
                </span>
                <input
                  type="number"
                  min="0"
                  value={balanceOwed}
                  onChange={(event) =>
                    setBalanceOwed(Number(event.target.value))
                  }
                  className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>

              {message ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                  {message}
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="h-12 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppNav from "@/components/AppNav";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/lib/supabase";

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const costNumber = Number(costPrice) || 0;
  const sellingNumber = Number(sellingPrice) || 0;
  const stockNumber = Number(stockQuantity) || 0;
  const lowStockNumber = Number(lowStockThreshold) || 5;
  const profitPerItem = sellingNumber - costNumber;
  const stockValue = stockNumber * costNumber;

  function formatMoney(amount: number) {
    return `$${Number(amount || 0).toLocaleString()}`;
  }

  async function handleSaveProduct() {
    setSaving(true);
    setErrorMessage("");

    if (!name.trim()) {
      setSaving(false);
      setErrorMessage("Product name is required.");
      return;
    }

    if (!category.trim()) {
      setSaving(false);
      setErrorMessage("Category is required.");
      return;
    }

    const { error } = await supabase.from("products").insert({
      name: name.trim(),
      category: category.trim(),
      cost_price: costNumber,
      selling_price: sellingNumber,
      stock_quantity: stockNumber,
      low_stock_threshold: lowStockNumber,
    });

    setSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/products");
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
                Add product
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Add a new item to your inventory, set prices, track stock, and
                create low-stock alerts.
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
                  href="/products"
                  className="flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Products
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
              <h2 className="text-lg font-semibold">Product details</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Enter the product name, category, prices, and stock quantity.
              </p>
            </div>

            <div className="mt-6 grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Product name
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Example: Rice"
                  className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Category
                </span>
                <input
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  placeholder="Example: Food"
                  className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Cost price
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={costPrice}
                    onChange={(event) => setCostPrice(event.target.value)}
                    placeholder="Example: 8"
                    className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Selling price
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={sellingPrice}
                    onChange={(event) => setSellingPrice(event.target.value)}
                    placeholder="Example: 12"
                    className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Stock quantity
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(event) => setStockQuantity(event.target.value)}
                    placeholder="Example: 20"
                    className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Low-stock threshold
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={lowStockThreshold}
                    onChange={(event) => setLowStockThreshold(event.target.value)}
                    className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>
              </div>

              {errorMessage ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                  {errorMessage}
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleSaveProduct}
                disabled={saving || !name.trim() || !category.trim()}
                className="h-12 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving product..." : "Save product"}
              </button>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:sticky lg:top-6 lg:self-start">
            <h2 className="text-lg font-semibold">Product summary</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review before saving.
            </p>

            <div className="mt-6 grid gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Product
                </p>
                <p className="mt-1 font-semibold">
                  {name.trim() || "Not entered"}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {category.trim() || "No category"}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Cost price
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {formatMoney(costNumber)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Selling price
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {formatMoney(sellingNumber)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Profit per item
                </p>
                <p
                  className={
                    profitPerItem >= 0
                      ? "mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400"
                      : "mt-1 text-2xl font-bold text-red-700 dark:text-red-400"
                  }
                >
                  {formatMoney(profitPerItem)}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Stock quantity
                  </p>
                  <p className="mt-1 text-2xl font-bold">{stockNumber}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Stock value
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {formatMoney(stockValue)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Low-stock alert
                </p>
                <p className="mt-1 font-semibold text-blue-900 dark:text-blue-100">
                  Alert when stock is {lowStockNumber} or lower
                </p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
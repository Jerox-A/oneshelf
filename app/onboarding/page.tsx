"use client";

import ThemeToggle from "@/components/ThemeToggle";
import { currencies } from "@/lib/currency";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ProductDraft = {
  name: string;
  category: string;
  cost_price: string;
  selling_price: string;
  stock_quantity: string;
  low_stock_threshold: string;
};

const emptyProduct: ProductDraft = {
  name: "",
  category: "",
  cost_price: "",
  selling_price: "",
  stock_quantity: "",
  low_stock_threshold: "5",
};

export default function OnboardingPage() {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [shopName, setShopName] = useState("");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [products, setProducts] = useState<ProductDraft[]>([{ ...emptyProduct }]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadUserAndSettings() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      const { data: settings } = await supabase
        .from("shop_settings")
        .select("shop_name, currency_code, setup_completed")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (settings?.setup_completed) {
        router.push("/dashboard");
        return;
      }

      if (settings?.shop_name) {
        setShopName(settings.shop_name);
      }

      if (settings?.currency_code) {
        setCurrencyCode(settings.currency_code);
        window.localStorage.setItem("oneshelf-currency", settings.currency_code);
      }

      setLoading(false);
    }

    loadUserAndSettings();
  }, [router]);

  function updateProduct(index: number, field: keyof ProductDraft, value: string) {
    setProducts((currentProducts) =>
      currentProducts.map((product, productIndex) =>
        productIndex === index ? { ...product, [field]: value } : product
      )
    );
  }

  function addProductRow() {
    setProducts((currentProducts) => [...currentProducts, { ...emptyProduct }]);
  }

  function removeProductRow(index: number) {
    setProducts((currentProducts) =>
      currentProducts.filter((_, productIndex) => productIndex !== index)
    );
  }

  async function handleFinishSetup() {
    setMessage("");

    if (!userId) {
      setMessage("Please log in again.");
      return;
    }

    if (!shopName.trim()) {
      setMessage("Please enter your shop name.");
      return;
    }

    const validProducts = products.filter((product) => product.name.trim());

    for (const product of validProducts) {
      if (Number(product.selling_price || 0) <= 0) {
        setMessage(`Please enter a selling price for ${product.name}.`);
        return;
      }

      if (Number(product.stock_quantity || 0) < 0) {
        setMessage(`Stock cannot be negative for ${product.name}.`);
        return;
      }
    }

    setSaving(true);

    const { error: settingsError } = await supabase.from("shop_settings").upsert(
      {
        owner_id: userId,
        shop_name: shopName.trim(),
        currency_code: currencyCode,
        setup_completed: true,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "owner_id",
      }
    );

    if (settingsError) {
      setSaving(false);
      setMessage(settingsError.message);
      return;
    }

    window.localStorage.setItem("oneshelf-currency", currencyCode);

    if (validProducts.length > 0) {
      const productsToInsert = validProducts.map((product) => ({
        name: product.name.trim(),
        category: product.category.trim() || null,
        cost_price: Number(product.cost_price || 0),
        selling_price: Number(product.selling_price || 0),
        stock_quantity: Number(product.stock_quantity || 0),
        low_stock_threshold: Number(product.low_stock_threshold || 0),
      }));

      const { error: productsError } = await supabase
        .from("products")
        .insert(productsToInsert);

      if (productsError) {
        setSaving(false);
        setMessage(productsError.message);
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Preparing your shop setup...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
                <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                OneShelf setup
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Set up your shop
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Choose your business currency, name your shop, and add your
                starting products before opening the dashboard.
              </p>
            </div>

            <ThemeToggle />
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <h2 className="text-xl font-bold">Basic settings</h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Shop name
                </span>
                <input
                  value={shopName}
                  onChange={(event) => setShopName(event.target.value)}
                  placeholder="Example: Ilya Mini Market"
                  className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Business currency
                </span>
                <select
                  value={currencyCode}
                  onChange={(event) => setCurrencyCode(event.target.value)}
                  className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} — {currency.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <aside className="rounded-3xl border border-blue-100 bg-blue-50 p-5 shadow-sm dark:border-blue-900 dark:bg-blue-950 sm:p-6">
            <h2 className="text-xl font-bold text-blue-950 dark:text-blue-100">
              Setup checklist
            </h2>

            <div className="mt-5 grid gap-3 text-sm text-blue-900 dark:text-blue-200">
              <div className="rounded-2xl bg-white/70 p-4 dark:bg-slate-950/40">
                1. Choose your shop currency
              </div>
              <div className="rounded-2xl bg-white/70 p-4 dark:bg-slate-950/40">
                2. Add your starting products
              </div>
              <div className="rounded-2xl bg-white/70 p-4 dark:bg-slate-950/40">
                3. Open your dashboard
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">Starting products</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Add the products you already sell. You can add more later.
              </p>
            </div>

            <button
              type="button"
              onClick={addProductRow}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              + Add product row
            </button>
          </div>

          <div className="mt-6 grid gap-4">
            {products.map((product, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                  <label className="grid gap-2 lg:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Product name
                    </span>
                    <input
                      value={product.name}
                      onChange={(event) =>
                        updateProduct(index, "name", event.target.value)
                      }
                      placeholder="Ice tea"
                      className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Category
                    </span>
                    <input
                      value={product.category}
                      onChange={(event) =>
                        updateProduct(index, "category", event.target.value)
                      }
                      placeholder="Drinks"
                      className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Cost
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={product.cost_price}
                      onChange={(event) =>
                        updateProduct(index, "cost_price", event.target.value)
                      }
                      placeholder="1"
                      className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Sell price
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={product.selling_price}
                      onChange={(event) =>
                        updateProduct(index, "selling_price", event.target.value)
                      }
                      placeholder="3"
                      className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Stock
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={product.stock_quantity}
                      onChange={(event) =>
                        updateProduct(
                          index,
                          "stock_quantity",
                          event.target.value
                        )
                      }
                      placeholder="20"
                      className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </label>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <label className="grid gap-2 sm:w-56">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Low stock alert
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={product.low_stock_threshold}
                      onChange={(event) =>
                        updateProduct(
                          index,
                          "low_stock_threshold",
                          event.target.value
                        )
                      }
                      className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </label>

                  {products.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeProductRow(index)}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                    >
                      Remove row
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {message ? (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
              {message}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Skip for now
            </button>

            <button
              type="button"
              onClick={handleFinishSetup}
              disabled={saving}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Finishing setup..." : "Finish setup"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
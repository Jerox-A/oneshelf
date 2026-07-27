"use client";

import AppNav from "@/components/AppNav";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  category: string;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = String(params.id);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [costPrice, setCostPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [stockQuantity, setStockQuantity] = useState(0);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProduct() {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, category, cost_price, selling_price, stock_quantity, low_stock_threshold"
        )
        .eq("id", productId)
        .single();

      if (error || !data) {
        setMessage(error?.message || "Product not found.");
        setLoading(false);
        return;
      }

      const product = data as Product;

      setName(product.name);
      setCategory(product.category);
      setCostPrice(Number(product.cost_price || 0));
      setSellingPrice(Number(product.selling_price || 0));
      setStockQuantity(Number(product.stock_quantity || 0));
      setLowStockThreshold(Number(product.low_stock_threshold || 5));
      setLoading(false);
    }

    loadProduct();
  }, [productId]);

  async function handleSave() {
    setMessage("");

    if (!name.trim()) {
      setMessage("Product name is required.");
      return;
    }

    if (!category.trim()) {
      setMessage("Category is required.");
      return;
    }

    if (costPrice < 0 || sellingPrice < 0 || stockQuantity < 0) {
      setMessage("Prices and stock cannot be negative.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("products")
      .update({
        name,
        category,
        cost_price: costPrice,
        selling_price: sellingPrice,
        stock_quantity: stockQuantity,
        low_stock_threshold: lowStockThreshold,
      })
      .eq("id", productId);

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/products");
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
                Edit product
              </h1>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Update product details, prices, stock, and restock alert level.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle />
              <LogoutButton />

              <a
                href="/products"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Back to products
              </a>
            </div>
          </div>

          <AppNav />
        </header>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading product...
            </p>
          ) : (
            <div className="grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Product name
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
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
                    onChange={(event) =>
                      setCostPrice(Number(event.target.value))
                    }
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
                    onChange={(event) =>
                      setSellingPrice(Number(event.target.value))
                    }
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
                    onChange={(event) =>
                      setStockQuantity(Number(event.target.value))
                    }
                    className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Low stock threshold
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={lowStockThreshold}
                    onChange={(event) =>
                      setLowStockThreshold(Number(event.target.value))
                    }
                    className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>
              </div>

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
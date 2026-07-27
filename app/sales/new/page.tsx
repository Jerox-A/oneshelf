"use client";

import AppNav from "@/components/AppNav";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/lib/supabase";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  selling_price: number;
  stock_quantity: number;
};

type Customer = {
  id: string;
  name: string;
  balance_owed: number;
};

export default function NewSalePage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      const [productsResponse, customersResponse] = await Promise.all([
        supabase
          .from("products")
          .select("id, name, selling_price, stock_quantity")
          .order("name", { ascending: true }),

        supabase
          .from("customers")
          .select("id, name, balance_owed")
          .order("name", { ascending: true }),
      ]);

      if (productsResponse.error || customersResponse.error) {
        setMessage(
          productsResponse.error?.message ||
            customersResponse.error?.message ||
            "Could not load data."
        );
      }

      setProducts((productsResponse.data || []) as Product[]);
      setCustomers((customersResponse.data || []) as Customer[]);
      setLoading(false);
    }

    loadData();
  }, []);

  const selectedProduct = useMemo(() => {
    return products.find((product) => product.id === productId);
  }, [products, productId]);

  const selectedCustomer = useMemo(() => {
    return customers.find((customer) => customer.id === customerId);
  }, [customers, customerId]);

  const unitPrice = Number(selectedProduct?.selling_price || 0);
  const totalAmount = unitPrice * Number(quantity || 0);
  const balanceOwed = Math.max(totalAmount - Number(amountPaid || 0), 0);

  function formatMoney(amount: number) {
    return `$${Number(amount || 0).toLocaleString()}`;
  }

  async function handleSaveSale() {
    setMessage("");

    if (!selectedCustomer) {
      setMessage("Please choose a customer.");
      return;
    }

    if (!selectedProduct) {
      setMessage("Please choose a product.");
      return;
    }

    if (quantity <= 0) {
      setMessage("Quantity must be at least 1.");
      return;
    }

    if (quantity > selectedProduct.stock_quantity) {
      setMessage(
        `Not enough stock. Only ${selectedProduct.stock_quantity} available.`
      );
      return;
    }

    if (amountPaid < 0) {
      setMessage("Amount paid cannot be negative.");
      return;
    }

    setSaving(true);

    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        customer_id: selectedCustomer.id,
        customer_name: selectedCustomer.name,
        total_amount: totalAmount,
        amount_paid: Number(amountPaid || 0),
        balance_owed: balanceOwed,
        payment_method: paymentMethod,
        notes: notes || null,
      })
      .select("id")
      .single();

    if (saleError || !sale) {
      setSaving(false);
      setMessage(saleError?.message || "Could not save sale.");
      return;
    }

    const { error: itemError } = await supabase.from("sale_items").insert({
      sale_id: sale.id,
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      quantity,
      unit_price: unitPrice,
      total_price: totalAmount,
    });

    if (itemError) {
      setSaving(false);
      setMessage(itemError.message);
      return;
    }

    const { error: productError } = await supabase
      .from("products")
      .update({
        stock_quantity: selectedProduct.stock_quantity - quantity,
      })
      .eq("id", selectedProduct.id);

    if (productError) {
      setSaving(false);
      setMessage(productError.message);
      return;
    }

    const { error: customerError } = await supabase
      .from("customers")
      .update({
        balance_owed: Number(selectedCustomer.balance_owed || 0) + balanceOwed,
        last_purchase_at: new Date().toISOString(),
      })
      .eq("id", selectedCustomer.id);

    if (customerError) {
      setSaving(false);
      setMessage(customerError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="border-b border-slate-200 pb-6 dark:border-slate-800">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                OneShelf
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                New sale
              </h1>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Record a sale, update product stock, and track customer balance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle />
              <LogoutButton />

              <a
                href="/sales"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Sales history
              </a>
            </div>
          </div>

          <AppNav />
        </header>

        {loading ? (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading products and customers...
            </p>
          </section>
        ) : (
          <section className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold">Sale details</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Choose the customer, product, quantity, and payment details.
              </p>

              <div className="mt-6 grid gap-5">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Customer
                  </span>
                  <select
                    value={customerId}
                    onChange={(event) => setCustomerId(event.target.value)}
                    className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <option value="">Choose customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Product
                  </span>
                  <select
                    value={productId}
                    onChange={(event) => setProductId(event.target.value)}
                    className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <option value="">Choose product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} — {formatMoney(product.selling_price)} —{" "}
                        {product.stock_quantity} in stock
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Quantity
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(event) =>
                        setQuantity(Number(event.target.value))
                      }
                      className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Amount paid
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={amountPaid}
                      onChange={(event) =>
                        setAmountPaid(Number(event.target.value))
                      }
                      className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    />
                  </label>
                </div>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Payment method
                  </span>
                  <select
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <option>Cash</option>
                    <option>Mobile Money</option>
                    <option>Card</option>
                    <option>Bank Transfer</option>
                    <option>Credit</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Notes
                  </span>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Optional sale note"
                    rows={4}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </label>

                {message ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                    {message}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handleSaveSale}
                  disabled={saving}
                  className="h-12 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving sale..." : "Save sale"}
                </button>
              </div>
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-semibold">Sale summary</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Review before saving.
              </p>

              <div className="mt-6 grid gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Customer
                  </p>
                  <p className="mt-1 font-semibold">
                    {selectedCustomer?.name || "Not selected"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Product
                  </p>
                  <p className="mt-1 font-semibold">
                    {selectedProduct?.name || "Not selected"}
                  </p>
                  {selectedProduct ? (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {selectedProduct.stock_quantity} currently in stock
                    </p>
                  ) : null}
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Total amount
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {formatMoney(totalAmount)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Amount paid
                  </p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                    {formatMoney(amountPaid)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Balance owed
                  </p>
                  <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-400">
                    {formatMoney(balanceOwed)}
                  </p>
                </div>
              </div>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}
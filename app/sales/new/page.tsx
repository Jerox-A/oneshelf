"use client";

import { useMemo, useState } from "react";
import AppNav from "@/components/AppNav";

const products = [
  { name: "Rice", price: 12, stock: "4 bags left" },
  { name: "Soap", price: 3, stock: "6 bars left" },
  { name: "Sugar", price: 10, stock: "3 packs left" },
  { name: "Cooking Oil", price: 14, stock: "18 bottles left" },
];

const customers = [
  "Walk-in customer",
  "Mary Johnson",
  "John Mensah",
  "Amina Yusuf",
];

const formatMoney = (amount: number) => {
  return `$${amount.toLocaleString()}`;
};

export default function NewSalePage() {
  const [selectedProductName, setSelectedProductName] = useState(
    products[0].name
  );
  const [quantity, setQuantity] = useState("1");
  const [amountPaid, setAmountPaid] = useState("");

  const selectedProduct = products.find(
    (product) => product.name === selectedProductName
  );

  const quantityNumber = Number(quantity) || 0;
  const paidNumber = Number(amountPaid) || 0;

  const totalAmount = useMemo(() => {
    return (selectedProduct?.price || 0) * quantityNumber;
  }, [selectedProduct, quantityNumber]);

  const balanceOwed = Math.max(totalAmount - paidNumber, 0);
  const isFullyPaid = totalAmount > 0 && balanceOwed === 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="border-b border-slate-800 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-emerald-300">OneShelf</p>
              <h1 className="mt-1 text-3xl font-bold">New sale</h1>
              <p className="mt-2 text-sm text-slate-400">
                Record a sale, calculate the balance, and prepare a simple
                receipt.
              </p>
            </div>

            <a
              href="/dashboard"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200"
            >
              Back to dashboard
            </a>
          </div>

          <AppNav />
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <form className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Sale details</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Fill in what the customer bought.
                </p>
              </div>

              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                Draft
              </span>
            </div>

            <div className="mt-6 grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-300">
                  Customer
                </span>
                <select className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-emerald-400">
                  {customers.map((customer) => (
                    <option key={customer}>{customer}</option>
                  ))}
                </select>
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-300">
                    Product
                  </span>
                  <select
                    value={selectedProductName}
                    onChange={(event) =>
                      setSelectedProductName(event.target.value)
                    }
                    className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-emerald-400"
                  >
                    {products.map((product) => (
                      <option key={product.name} value={product.name}>
                        {product.name} — {formatMoney(product.price)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-300">
                    Quantity
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-emerald-400"
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-300">
                    Amount paid
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={amountPaid}
                    onChange={(event) => setAmountPaid(event.target.value)}
                    placeholder="0"
                    className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-emerald-400"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-300">
                    Payment method
                  </span>
                  <select className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-emerald-400">
                    <option>Cash</option>
                    <option>Mobile money</option>
                    <option>Bank transfer</option>
                    <option>Credit / Pay later</option>
                  </select>
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-300">
                  Notes
                </span>
                <textarea
                  placeholder="Example: Customer will pay balance on Friday"
                  className="min-h-28 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                />
              </label>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="mt-1 text-xl font-bold">
                      {formatMoney(totalAmount)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Paid</p>
                    <p className="mt-1 text-xl font-bold text-emerald-300">
                      {formatMoney(paidNumber)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Balance</p>
                    <p className="mt-1 text-xl font-bold text-amber-300">
                      {formatMoney(balanceOwed)}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="h-12 rounded-2xl bg-emerald-400 font-semibold text-slate-950 hover:bg-emerald-300"
              >
                Save sale
              </button>
            </div>
          </form>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Receipt preview</h2>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    isFullyPaid
                      ? "bg-emerald-400/10 text-emerald-300"
                      : "bg-amber-400/10 text-amber-300"
                  }`}
                >
                  {isFullyPaid ? "Paid" : "Balance due"}
                </span>
              </div>

              <div className="mt-6 rounded-2xl bg-white p-5 text-slate-950">
                <div className="border-b border-slate-200 pb-4">
                  <p className="text-lg font-bold">OneShelf Store</p>
                  <p className="text-sm text-slate-500">Receipt preview</p>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span>Product</span>
                    <span className="font-semibold">{selectedProductName}</span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>Unit price</span>
                    <span>{formatMoney(selectedProduct?.price || 0)}</span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>Quantity</span>
                    <span>{quantityNumber}</span>
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex justify-between gap-4">
                      <span>Total</span>
                      <span className="font-bold">
                        {formatMoney(totalAmount)}
                      </span>
                    </div>

                    <div className="mt-2 flex justify-between gap-4">
                      <span>Paid</span>
                      <span>{formatMoney(paidNumber)}</span>
                    </div>

                    <div className="mt-2 flex justify-between gap-4">
                      <span>Balance</span>
                      <span className="font-bold text-amber-600">
                        {formatMoney(balanceOwed)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">Product stock</h2>

              <div className="mt-5 space-y-3">
                {products.map((product) => (
                  <div
                    key={product.name}
                    className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm font-semibold text-emerald-300">
                        {formatMoney(product.price)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                      {product.stock}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
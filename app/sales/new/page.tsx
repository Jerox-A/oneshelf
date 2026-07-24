"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

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

type NewSalePageProps = {
  products: Product[];
  customers: Customer[];
};

function formatMoney(amount: number) {
  return `$${amount.toLocaleString()}`;
}

export default function NewSalePage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadData() {
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("id, name, selling_price, stock_quantity")
      .order("name", { ascending: true });

    const { data: customerData, error: customerError } = await supabase
      .from("customers")
      .select("id, name, balance_owed")
      .order("name", { ascending: true });

    if (productError || customerError) {
      setErrorMessage(
        productError?.message || customerError?.message || "Could not load data"
      );
      return;
    }

    const productList = (productData || []) as Product[];
    const customerList = (customerData || []) as Customer[];

    setProducts(productList);
    setCustomers(customerList);

    if (productList.length > 0 && !productId) {
      setProductId(productList[0].id);
    }

    if (customerList.length > 0 && !customerId) {
      setCustomerId(customerList[0].id);
    }

    setLoaded(true);
  }

  if (!loaded && !errorMessage) {
    loadData();
  }

  const selectedProduct = products.find((product) => product.id === productId);
  const selectedCustomer = customers.find(
    (customer) => customer.id === customerId
  );

  const quantityNumber = Number(quantity) || 0;
  const paidNumber = Number(amountPaid) || 0;
  const unitPrice = Number(selectedProduct?.selling_price || 0);
  const totalAmount = unitPrice * quantityNumber;
  const balanceOwed = Math.max(totalAmount - paidNumber, 0);
  const isFullyPaid = totalAmount > 0 && balanceOwed === 0;

  async function handleSaveSale() {
    setSaving(true);
    setErrorMessage("");

    if (!selectedProduct || !selectedCustomer) {
      setErrorMessage("Please select a customer and product.");
      setSaving(false);
      return;
    }

    if (quantityNumber <= 0) {
      setErrorMessage("Quantity must be at least 1.");
      setSaving(false);
      return;
    }

    if (quantityNumber > selectedProduct.stock_quantity) {
      setErrorMessage("Not enough stock for this product.");
      setSaving(false);
      return;
    }

    const { data: saleData, error: saleError } = await supabase
      .from("sales")
      .insert({
        customer_id: selectedCustomer.id,
        customer_name: selectedCustomer.name,
        total_amount: totalAmount,
        amount_paid: paidNumber,
        balance_owed: balanceOwed,
        payment_method: paymentMethod,
        notes,
      })
      .select("id")
      .single();

    if (saleError || !saleData) {
      setErrorMessage(saleError?.message || "Could not save sale.");
      setSaving(false);
      return;
    }

    const { error: itemError } = await supabase.from("sale_items").insert({
      sale_id: saleData.id,
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      quantity: quantityNumber,
      unit_price: unitPrice,
      total_price: totalAmount,
    });

    if (itemError) {
      setErrorMessage(itemError.message);
      setSaving(false);
      return;
    }

    const { error: productUpdateError } = await supabase
      .from("products")
      .update({
        stock_quantity: selectedProduct.stock_quantity - quantityNumber,
      })
      .eq("id", selectedProduct.id);

    if (productUpdateError) {
      setErrorMessage(productUpdateError.message);
      setSaving(false);
      return;
    }

    const { error: customerUpdateError } = await supabase
      .from("customers")
      .update({
        balance_owed: Number(selectedCustomer.balance_owed || 0) + balanceOwed,
        last_purchase_at: new Date().toISOString(),
      })
      .eq("id", selectedCustomer.id);

    if (customerUpdateError) {
      setErrorMessage(customerUpdateError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="border-b border-slate-800 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-emerald-300">OneShelf</p>
              <h1 className="mt-1 text-3xl font-bold">New sale</h1>
              <p className="mt-2 text-sm text-slate-400">
                Record a real sale, update stock, and track what is still owed.
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
                  Choose a customer and product.
                </p>
              </div>

              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                Real database
              </span>
            </div>

            <div className="mt-6 grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-300">
                  Customer
                </span>
                <select
                  value={customerId}
                  onChange={(event) => setCustomerId(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-emerald-400"
                >
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-300">
                    Product
                  </span>
                  <select
                    value={productId}
                    onChange={(event) => setProductId(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-emerald-400"
                  >
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} — {formatMoney(product.selling_price)}
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
                  <select
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-emerald-400"
                  >
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
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Example: Customer will pay balance on Friday"
                  className="min-h-28 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
                />
              </label>

              {errorMessage ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                  {errorMessage}
                </div>
              ) : null}

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
                onClick={handleSaveSale}
                disabled={saving || !customerId || !productId}
                className="h-12 rounded-2xl bg-emerald-400 font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save sale"}
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
                    <span>Customer</span>
                    <span className="font-semibold">
                      {selectedCustomer?.name || "No customer"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>Product</span>
                    <span className="font-semibold">
                      {selectedProduct?.name || "No product"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>Unit price</span>
                    <span>{formatMoney(unitPrice)}</span>
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
              <h2 className="text-xl font-semibold">Stock check</h2>

              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <p className="font-semibold">
                  {selectedProduct?.name || "No product"}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Current stock: {selectedProduct?.stock_quantity || 0}
                </p>
                <p className="mt-1 text-sm text-emerald-300">
                  After sale:{" "}
                  {Math.max(
                    Number(selectedProduct?.stock_quantity || 0) -
                      quantityNumber,
                    0
                  )}
                </p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
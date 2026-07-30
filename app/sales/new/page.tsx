"use client";

import AppNav from "@/components/AppNav";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import { currencies, formatMoney } from "@/lib/currency";
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

type CartItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  stock_quantity: number;
};

const WALK_IN_CUSTOMER_ID = "walk-in-customer";

export default function NewSalePage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [customerId, setCustomerId] = useState(WALK_IN_CUSTOMER_ID);

  const [productSearch, setProductSearch] = useState("");
  const [productId, setProductId] = useState("");
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [currencyCode, setCurrencyCode] = useState("USD");
  const [amountPaidInput, setAmountPaidInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedCurrency = window.localStorage.getItem("oneshelf-currency");

    if (savedCurrency) {
      setCurrencyCode(savedCurrency);
    }

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

  const selectedCurrency =
    currencies.find((currency) => currency.code === currencyCode) ||
    currencies[0];

  const selectedProduct = useMemo(() => {
    return products.find((product) => product.id === productId);
  }, [products, productId]);

  const filteredProducts = useMemo(() => {
    const search = productSearch.trim().toLowerCase();

    if (!search) {
      return products.slice(0, 8);
    }

    return products
      .filter((product) => product.name.toLowerCase().includes(search))
      .slice(0, 8);
  }, [products, productSearch]);

  const selectedCustomer = useMemo(() => {
    if (customerId === WALK_IN_CUSTOMER_ID) {
      return null;
    }

    return customers.find((customer) => customer.id === customerId) || null;
  }, [customers, customerId]);

  const isWalkInCustomer = customerId === WALK_IN_CUSTOMER_ID;
  const displayCustomerName = isWalkInCustomer
    ? "Customer / Walk-in"
    : selectedCustomer?.name || "Not selected";

  const amountPaid = Number(amountPaidInput || 0);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + Number(item.total_price || 0),
    0
  );

  const totalQuantity = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const balanceOwed = Math.max(totalAmount - amountPaid, 0);

  function handleCurrencyChange(value: string) {
    setCurrencyCode(value);
    window.localStorage.setItem("oneshelf-currency", value);
  }

  function handleAmountPaidChange(value: string) {
    const cleanedValue = value.replace(/^0+(?=\d)/, "");
    setAmountPaidInput(cleanedValue);
  }

  function getCartQuantityForProduct(productIdToCheck: string) {
    return cartItems
      .filter((item) => item.product_id === productIdToCheck)
      .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }

  function handleChooseProduct(product: Product) {
    setProductId(product.id);
    setProductSearch(product.name);
    setShowProductSuggestions(false);
    setMessage("");
  }

  function handleAddItem() {
    setMessage("");

    if (!selectedProduct) {
      setMessage("Please choose a product from the suggestions.");
      return;
    }

    if (quantity <= 0) {
      setMessage("Quantity must be at least 1.");
      return;
    }

    const existingCartQuantity = getCartQuantityForProduct(selectedProduct.id);
    const newTotalQuantity = existingCartQuantity + Number(quantity || 0);

    if (newTotalQuantity > selectedProduct.stock_quantity) {
      setMessage(
        `Not enough stock. Only ${selectedProduct.stock_quantity} available.`
      );
      return;
    }

    const unitPrice = Number(selectedProduct.selling_price || 0);
    const itemTotal = unitPrice * Number(quantity || 0);

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.product_id === selectedProduct.id
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.product_id === selectedProduct.id
            ? {
                ...item,
                quantity: item.quantity + Number(quantity || 0),
                total_price:
                  item.unit_price * (item.quantity + Number(quantity || 0)),
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          quantity: Number(quantity || 0),
          unit_price: unitPrice,
          total_price: itemTotal,
          stock_quantity: selectedProduct.stock_quantity,
        },
      ];
    });

    setProductId("");
    setProductSearch("");
    setQuantity(1);
    setShowProductSuggestions(false);
  }

  function handleRemoveItem(productIdToRemove: string) {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.product_id !== productIdToRemove)
    );
  }

  async function handleSaveSale() {
    setMessage("");

    if (!isWalkInCustomer && !selectedCustomer) {
      setMessage("Please choose a customer or use Customer / Walk-in.");
      return;
    }

    if (cartItems.length === 0) {
      setMessage("Please add at least one product to the sale.");
      return;
    }

    if (amountPaid < 0) {
      setMessage("Amount paid cannot be negative.");
      return;
    }

    for (const item of cartItems) {
      const product = products.find((product) => product.id === item.product_id);

      if (!product) {
        setMessage(`Could not find product: ${item.product_name}`);
        return;
      }

      if (item.quantity > product.stock_quantity) {
        setMessage(
          `Not enough stock for ${item.product_name}. Only ${product.stock_quantity} available.`
        );
        return;
      }
    }

    setSaving(true);

    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        customer_id: isWalkInCustomer ? null : selectedCustomer?.id,
        customer_name: isWalkInCustomer
          ? "Customer / Walk-in"
          : selectedCustomer?.name,
        total_amount: totalAmount,
        amount_paid: amountPaid,
        balance_owed: balanceOwed,
        payment_method: paymentMethod,
        currency_code: currencyCode,
        notes: notes || null,
      })
      .select("id")
      .single();

    if (saleError || !sale) {
      setSaving(false);
      setMessage(saleError?.message || "Could not save sale.");
      return;
    }

    const saleItemsToInsert = cartItems.map((item) => ({
      sale_id: sale.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }));

    const { error: itemError } = await supabase
      .from("sale_items")
      .insert(saleItemsToInsert);

    if (itemError) {
      setSaving(false);
      setMessage(itemError.message);
      return;
    }

    for (const item of cartItems) {
      const product = products.find((product) => product.id === item.product_id);

      if (!product) {
        setSaving(false);
        setMessage(`Could not update stock for ${item.product_name}.`);
        return;
      }

      const { error: productError } = await supabase
        .from("products")
        .update({
          stock_quantity: product.stock_quantity - item.quantity,
        })
        .eq("id", item.product_id);

      if (productError) {
        setSaving(false);
        setMessage(productError.message);
        return;
      }
    }

    if (!isWalkInCustomer && selectedCustomer) {
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
    }

    router.push(`/sales/${sale.id}`);
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
                New sale
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Search products, add multiple items to one sale, update stock,
                and create one receipt.
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
                  href="/sales"
                  className="flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Sales history
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <AppNav />
          </div>
        </header>

        {loading ? (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading products and customers...
            </p>
          </section>
        ) : (
          <section className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Sale details</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Choose a customer, type to search products, add them to the
                  cart, then save the sale.
                </p>
              </div>

              <div className="mt-6 grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Customer
                    </span>
                    <select
                      value={customerId}
                      onChange={(event) => setCustomerId(event.target.value)}
                      className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                    >
                      <option value={WALK_IN_CUSTOMER_ID}>
                        Customer / Walk-in
                      </option>

                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Currency
                    </span>
                    <select
                      value={currencyCode}
                      onChange={(event) =>
                        handleCurrencyChange(event.target.value)
                      }
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

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <h3 className="font-semibold">Add product</h3>

                  <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_140px_auto]">
                    <label className="relative grid gap-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Product
                      </span>

                      <input
                        type="text"
                        value={productSearch}
                        onChange={(event) => {
                          setProductSearch(event.target.value);
                          setProductId("");
                          setShowProductSuggestions(true);
                        }}
                        onFocus={() => setShowProductSuggestions(true)}
                        placeholder="Type product name..."
                        className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />

                      {showProductSuggestions ? (
                        <div className="absolute left-0 right-0 top-[76px] z-20 max-h-72 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                          {filteredProducts.length === 0 ? (
                            <div className="p-4 text-sm text-slate-500 dark:text-slate-400">
                              No products found.
                            </div>
                          ) : (
                            filteredProducts.map((product) => (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => handleChooseProduct(product)}
                                className="block w-full border-b border-slate-100 px-4 py-3 text-left text-sm hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                              >
                                <span className="font-semibold">
                                  {product.name}
                                </span>

                                <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                                  {formatMoney(
                                    product.selling_price,
                                    currencyCode
                                  )}{" "}
                                  — {product.stock_quantity} in stock
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      ) : null}
                    </label>

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
                        className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="h-12 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:self-end"
                    >
                      Add item
                    </button>
                  </div>

                  {selectedProduct ? (
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                      Selected:{" "}
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {selectedProduct.name}
                      </span>{" "}
                      —{" "}
                      {formatMoney(
                        selectedProduct.selling_price,
                        currencyCode
                      )}{" "}
                      — {selectedProduct.stock_quantity} in stock
                    </p>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">Sale items</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {cartItems.length} products added
                      </p>
                    </div>

                    <p className="text-lg font-bold">
                      {formatMoney(totalAmount, currencyCode)}
                    </p>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {cartItems.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                        No products added yet.
                      </div>
                    ) : (
                      cartItems.map((item) => (
                        <div
                          key={item.product_id}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="font-semibold">{item.product_name}</p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              {item.quantity} ×{" "}
                              {formatMoney(item.unit_price, currencyCode)}
                            </p>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-4 sm:mt-0">
                            <p className="font-bold">
                              {formatMoney(item.total_price, currencyCode)}
                            </p>

                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.product_id)}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Amount paid
                    </span>

                    <div className="flex h-12 overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-blue-500 dark:border-slate-700 dark:bg-slate-950">
                      <span className="flex items-center border-r border-slate-200 px-4 text-sm font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        {selectedCurrency.symbol}
                      </span>

                      <input
                        type="text"
                        inputMode="decimal"
                        value={amountPaidInput}
                        onChange={(event) =>
                          handleAmountPaidChange(event.target.value)
                        }
                        placeholder="0"
                        className="h-full w-full bg-transparent px-4 text-slate-950 outline-none dark:text-slate-100"
                      />
                    </div>
                  </label>

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
                </div>

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

                {isWalkInCustomer && balanceOwed > 0 ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                    This is a walk-in sale with unpaid balance. The sale will
                    show the balance, but it will not be attached to a saved
                    customer account.
                  </div>
                ) : null}

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
                  {saving ? "Saving sale..." : "Save sale and open receipt"}
                </button>
              </div>
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:sticky lg:top-6 lg:self-start">
              <h2 className="text-lg font-semibold">Sale summary</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Review before saving.
              </p>

              <div className="mt-6 grid gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Currency
                  </p>
                  <p className="mt-1 font-semibold">
                    {selectedCurrency.symbol} — {selectedCurrency.label}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Customer
                  </p>
                  <p className="mt-1 font-semibold">{displayCustomerName}</p>

                  {selectedCustomer ? (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Current balance:{" "}
                      {formatMoney(
                        selectedCustomer.balance_owed,
                        currencyCode
                      )}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Not saved to customer list
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Products
                    </p>
                    <p className="mt-1 text-2xl font-bold">
                      {cartItems.length}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Total quantity
                    </p>
                    <p className="mt-1 text-2xl font-bold">{totalQuantity}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Total amount
                  </p>
                  <p className="mt-1 text-3xl font-bold">
                    {formatMoney(totalAmount, currencyCode)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Amount paid
                  </p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                    {formatMoney(amountPaid, currencyCode)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Balance owed
                  </p>
                  <p className="mt-1 text-2xl font-bold text-amber-800 dark:text-amber-200">
                    {formatMoney(balanceOwed, currencyCode)}
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
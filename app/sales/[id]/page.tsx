import AppNav from "@/components/AppNav";
import LogoutButton from "@/components/LogoutButton";
import PrintReceiptButton from "@/components/PrintReceiptButton";
import ThemeToggle from "@/components/ThemeToggle";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type Sale = {
  id: string;
  customer_name: string;
  total_amount: number;
  amount_paid: number;
  balance_owed: number;
  payment_method: string;
  currency_code: string | null;
  notes: string | null;
  created_at: string;
};

type SaleItem = {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

const currencies = [
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "EGP", label: "Egyptian Pound", symbol: "E£" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "AED", label: "UAE Dirham", symbol: "AED" },
  { code: "SAR", label: "Saudi Riyal", symbol: "SAR" },
];

export const dynamic = "force-dynamic";

function getCurrencySymbol(currencyCode: string | null) {
  return (
    currencies.find((currency) => currency.code === currencyCode)?.symbol || "$"
  );
}

function getCurrencyLabel(currencyCode: string | null) {
  return (
    currencies.find((currency) => currency.code === currencyCode)?.label ||
    "US Dollar"
  );
}

function formatMoney(amount: number, currencyCode: string | null) {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol} ${Number(amount || 0).toLocaleString()}`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function SaleReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [saleResponse, itemsResponse] = await Promise.all([
    supabase
      .from("sales")
      .select(
        "id, customer_name, total_amount, amount_paid, balance_owed, payment_method, currency_code, notes, created_at"
      )
      .eq("id", id)
      .single(),

    supabase
      .from("sale_items")
      .select("id, product_name, quantity, unit_price, total_price")
      .eq("sale_id", id)
      .order("created_at", { ascending: true }),
  ]);

  const error = saleResponse.error || itemsResponse.error;

  if (error || !saleResponse.data) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
        <p className="text-xl font-bold">Could not load receipt.</p>
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error?.message || "Sale not found."}
        </p>
      </main>
    );
  }

  const sale = saleResponse.data as Sale;
  const items = (itemsResponse.data || []) as SaleItem[];
  const currencyCode = sale.currency_code || "USD";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-6 print:max-w-none print:px-0 print:py-0 sm:px-6 sm:py-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm print:hidden dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
                <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                OneShelf
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Sale receipt
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Review, print, or share this sale receipt from one clean
                workspace.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-inner dark:border-slate-800 dark:bg-slate-950">
              <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-1">
                <div className="rounded-xl bg-white p-1 shadow-sm dark:bg-slate-900">
                  <ThemeToggle />
                </div>

                <div className="rounded-xl bg-white p-1 shadow-sm dark:bg-slate-900">
                  <LogoutButton />
                </div>

                <div className="rounded-xl bg-white p-1 shadow-sm dark:bg-slate-900">
                  <PrintReceiptButton />
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

        <section className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm print:mt-0 print:max-w-none print:rounded-none print:border-none print:shadow-none dark:border-slate-800 dark:bg-slate-900">
          <div className="bg-slate-950 p-6 text-white print:bg-white print:text-slate-950 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-300 print:text-slate-700">
                  OneShelf
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight">
                  Receipt
                </h2>

                <p className="mt-2 text-sm text-slate-300 print:text-slate-600">
                  Receipt ID: {sale.id.slice(0, 8)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-left print:border-slate-200 print:bg-white sm:text-right">
                <p className="text-sm text-slate-300 print:text-slate-500">
                  Date
                </p>
                <p className="mt-1 font-semibold">
                  {formatDate(sale.created_at)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Customer
                </p>
                <p className="mt-1 font-semibold">{sale.customer_name}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Payment method
                </p>
                <p className="mt-1 font-semibold">{sale.payment_method}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Currency
                </p>
                <p className="mt-1 font-semibold">
                  {getCurrencySymbol(currencyCode)} —{" "}
                  {getCurrencyLabel(currencyCode)}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:hidden">
              {items.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                  No receipt items found.
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{item.product_name}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Qty {item.quantity} ×{" "}
                          {formatMoney(item.unit_price, currencyCode)}
                        </p>
                      </div>

                      <p className="font-bold">
                        {formatMoney(item.total_price, currencyCode)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 hidden overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Unit price</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {items.length === 0 ? (
                    <tr className="border-t border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-5 text-slate-500" colSpan={4}>
                        No receipt items found.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-slate-200 dark:border-slate-800"
                      >
                        <td className="px-4 py-3 font-semibold">
                          {item.product_name}
                        </td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3">
                          {formatMoney(item.unit_price, currencyCode)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {formatMoney(item.total_price, currencyCode)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 sm:p-5">
              <div className="grid gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    Total amount
                  </span>
                  <span className="font-semibold">
                    {formatMoney(sale.total_amount, currencyCode)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    Amount paid
                  </span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    {formatMoney(sale.amount_paid, currencyCode)}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Balance owed</span>
                    <span className="font-bold text-amber-700 dark:text-amber-400">
                      {formatMoney(sale.balance_owed, currencyCode)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {sale.notes ? (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Notes
                </p>
                <p className="mt-1 text-sm">{sale.notes}</p>
              </div>
            ) : null}

            <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Thank you for your purchase.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
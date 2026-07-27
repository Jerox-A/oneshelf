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

export const dynamic = "force-dynamic";

function formatMoney(amount: number) {
  return `$${Number(amount || 0).toLocaleString()}`;
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
        "id, customer_name, total_amount, amount_paid, balance_owed, payment_method, notes, created_at"
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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <header className="border-b border-slate-200 pb-6 print:hidden dark:border-slate-800">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                OneShelf
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Sale receipt
              </h1>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Review, print, or share this sale receipt.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle />
              <LogoutButton />
              <PrintReceiptButton />

              <a
                href="/sales"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Back to sales
              </a>
            </div>
          </div>

          <AppNav />
        </header>

        <section className="mx-auto mt-8 max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm print:mt-0 print:border-none print:shadow-none dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                  OneShelf
                </p>
                <h2 className="mt-2 text-2xl font-bold">Receipt</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Receipt ID: {sale.id.slice(0, 8)}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Date
                </p>
                <p className="mt-1 font-semibold">
                  {formatDate(sale.created_at)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Customer
              </p>
              <p className="mt-1 font-semibold">{sale.customer_name}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Payment method
              </p>
              <p className="mt-1 font-semibold">{sale.payment_method}</p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Unit price</th>
                  <th className="px-4 py-3">Total</th>
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
                        {formatMoney(item.unit_price)}
                      </td>
                      <td className="px-4 py-3">
                        {formatMoney(item.total_price)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid gap-3 border-t border-slate-200 pt-6 dark:border-slate-800">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">
                Total amount
              </span>
              <span className="font-semibold">
                {formatMoney(sale.total_amount)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">
                Amount paid
              </span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {formatMoney(sale.amount_paid)}
              </span>
            </div>

            <div className="flex justify-between text-lg">
              <span className="font-semibold">Balance owed</span>
              <span className="font-bold text-amber-700 dark:text-amber-400">
                {formatMoney(sale.balance_owed)}
              </span>
            </div>
          </div>

          {sale.notes ? (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Notes
              </p>
              <p className="mt-1 text-sm">{sale.notes}</p>
            </div>
          ) : null}

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Thank you for your purchase.
          </p>
        </section>
      </div>
    </main>
  );
}
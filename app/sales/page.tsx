import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

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
  sale_id: string;
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
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function SalesPage() {
  const [salesResponse, saleItemsResponse] = await Promise.all([
    supabase
      .from("sales")
      .select(
        "id, customer_name, total_amount, amount_paid, balance_owed, payment_method, notes, created_at"
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("sale_items")
      .select("id, sale_id, product_name, quantity, unit_price, total_price")
      .order("created_at", { ascending: false }),
  ]);

  const error = salesResponse.error || saleItemsResponse.error;

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <p>Could not load sales.</p>
        <p className="mt-2 text-sm text-red-300">{error.message}</p>
      </main>
    );
  }

  const sales = (salesResponse.data || []) as Sale[];
  const saleItems = (saleItemsResponse.data || []) as SaleItem[];

  const totalSales = sales.reduce(
    (sum, sale) => sum + Number(sale.total_amount || 0),
    0
  );

  const totalPaid = sales.reduce(
    (sum, sale) => sum + Number(sale.amount_paid || 0),
    0
  );

  const totalBalance = sales.reduce(
    (sum, sale) => sum + Number(sale.balance_owed || 0),
    0
  );

  function getSaleItemSummary(saleId: string) {
    const matchingItems = saleItems.filter((item) => item.sale_id === saleId);

    if (matchingItems.length === 0) {
      return "No items";
    }

    return matchingItems
      .map((item) => `${item.product_name} x ${item.quantity}`)
      .join(", ");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="border-b border-slate-800 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-emerald-300">OneShelf</p>
              <h1 className="mt-1 text-3xl font-bold">Sales history</h1>
              <p className="mt-2 text-sm text-slate-400">
                View every saved sale, payment, and unpaid balance.
              </p>
            </div>

            <a
              href="/sales/new"
              className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              New sale
            </a>
          </div>

          <AppNav />
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total sales</p>
            <p className="mt-3 text-3xl font-bold">{formatMoney(totalSales)}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total paid</p>
            <p className="mt-3 text-3xl font-bold text-emerald-300">
              {formatMoney(totalPaid)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total balance</p>
            <p className="mt-3 text-3xl font-bold text-amber-300">
              {formatMoney(totalBalance)}
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">All sales</h2>
              <p className="text-sm text-slate-400">Loaded from Supabase</p>
            </div>

            <a
              href="/sales/new"
              className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              New sale
            </a>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Paid</th>
                  <th className="px-4 py-3">Balance</th>
                  <th className="px-4 py-3">Payment</th>
                </tr>
              </thead>

              <tbody>
                {sales.length === 0 ? (
                  <tr className="border-t border-slate-800">
                    <td className="px-4 py-5 text-slate-400" colSpan={7}>
                      No sales yet. Create your first sale.
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="border-t border-slate-800">
                      <td className="px-4 py-3 text-slate-400">
                        {formatDate(sale.created_at)}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {sale.customer_name}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {getSaleItemSummary(sale.id)}
                      </td>
                      <td className="px-4 py-3">
                        {formatMoney(sale.total_amount)}
                      </td>
                      <td className="px-4 py-3 text-emerald-300">
                        {formatMoney(sale.amount_paid)}
                      </td>
                      <td className="px-4 py-3 text-amber-300">
                        {formatMoney(sale.balance_owed)}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {sale.payment_method}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
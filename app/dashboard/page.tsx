import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  stock_quantity: number;
  low_stock_threshold: number;
};

type Customer = {
  id: string;
  name: string;
  balance_owed: number;
};

type Sale = {
  id: string;
  customer_name: string;
  total_amount: number;
  amount_paid: number;
  balance_owed: number;
  payment_method: string;
  created_at: string;
};

type SaleItem = {
  id: string;
  sale_id: string;
  product_name: string;
  quantity: number;
};

export const dynamic = "force-dynamic";

function formatMoney(amount: number) {
  return `$${amount.toLocaleString()}`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default async function DashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    productsResponse,
    customersResponse,
    salesResponse,
    saleItemsResponse,
  ] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, stock_quantity, low_stock_threshold")
      .order("name", { ascending: true }),

    supabase
      .from("customers")
      .select("id, name, balance_owed")
      .order("name", { ascending: true }),

    supabase
      .from("sales")
      .select(
        "id, customer_name, total_amount, amount_paid, balance_owed, payment_method, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(8),

    supabase
      .from("sale_items")
      .select("id, sale_id, product_name, quantity")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const error =
    productsResponse.error ||
    customersResponse.error ||
    salesResponse.error ||
    saleItemsResponse.error;

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <p>Could not load dashboard.</p>
        <p className="mt-2 text-sm text-red-300">{error.message}</p>
      </main>
    );
  }

  const products = (productsResponse.data || []) as Product[];
  const customers = (customersResponse.data || []) as Customer[];
  const sales = (salesResponse.data || []) as Sale[];
  const saleItems = (saleItemsResponse.data || []) as SaleItem[];

  const lowStockProducts = products.filter(
    (product) => product.stock_quantity <= product.low_stock_threshold
  );

  const todaySales = sales.filter((sale) => {
    const saleDate = new Date(sale.created_at);
    return saleDate >= today;
  });

  const todaySalesTotal = todaySales.reduce(
    (sum, sale) => sum + Number(sale.total_amount || 0),
    0
  );

  const todayCashCollected = todaySales.reduce(
    (sum, sale) => sum + Number(sale.amount_paid || 0),
    0
  );

  const totalCustomerDebt = customers.reduce(
    (sum, customer) => sum + Number(customer.balance_owed || 0),
    0
  );

  const customersOwing = customers.filter(
    (customer) => Number(customer.balance_owed || 0) > 0
  ).length;

  const stats = [
    {
      label: "Today’s sales",
      value: formatMoney(todaySalesTotal),
      helper: `${todaySales.length} sale${todaySales.length === 1 ? "" : "s"} today`,
    },
    {
      label: "Cash collected",
      value: formatMoney(todayCashCollected),
      helper: "From today’s sales",
    },
    {
      label: "Customers owing",
      value: String(customersOwing),
      helper: `${formatMoney(totalCustomerDebt)} total owed`,
    },
    {
      label: "Low stock items",
      value: String(lowStockProducts.length),
      helper: "Restock soon",
    },
  ];

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
              <h1 className="mt-1 text-3xl font-bold">Shop dashboard</h1>
              <p className="mt-2 text-sm text-slate-400">
                Real-time shop summary from your Supabase database.
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

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="mt-3 text-3xl font-bold">{stat.value}</p>
              <p className="mt-2 text-sm text-slate-500">{stat.helper}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 lg:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Recent sales</h2>
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
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Paid</th>
                    <th className="px-4 py-3">Balance</th>
                  </tr>
                </thead>

                <tbody>
                  {sales.length === 0 ? (
                    <tr className="border-t border-slate-800">
                      <td className="px-4 py-5 text-slate-400" colSpan={6}>
                        No sales yet. Create your first sale.
                      </td>
                    </tr>
                  ) : (
                    sales.map((sale) => (
                      <tr key={sale.id} className="border-t border-slate-800">
                        <td className="px-4 py-3 text-slate-400">
                          {formatDate(sale.created_at)}
                        </td>
                        <td className="px-4 py-3">{sale.customer_name}</td>
                        <td className="px-4 py-3 text-slate-300">
                          {getSaleItemSummary(sale.id)}
                        </td>
                        <td className="px-4 py-3">
                          {formatMoney(Number(sale.total_amount || 0))}
                        </td>
                        <td className="px-4 py-3 text-emerald-300">
                          {formatMoney(Number(sale.amount_paid || 0))}
                        </td>
                        <td className="px-4 py-3 text-amber-300">
                          {formatMoney(Number(sale.balance_owed || 0))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Low stock</h2>
                <p className="text-sm text-slate-400">Products to restock</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {lowStockProducts.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">
                    No low-stock products right now.
                  </p>
                </div>
              ) : (
                lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <p className="font-semibold">{product.name}</p>
                    <p className="mt-1 text-sm text-amber-300">
                      {product.stock_quantity} left
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
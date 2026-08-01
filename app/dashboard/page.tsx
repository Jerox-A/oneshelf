import AppNav from "@/components/AppNav";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import { formatMoney } from "@/lib/currency";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getShopSettings } from "@/lib/shopSettingsServer";
import { redirect } from "next/navigation";

type Sale = {
  id: string;
  customer_name: string;
  total_amount: number;
  amount_paid: number;
  balance_owed: number;
  created_at: string;
};

type SaleItem = {
  id: string;
  sale_id: string;
  product_name: string;
  quantity: number;
};

type Product = {
  id: string;
  name: string;
  stock_quantity: number;
  low_stock_threshold: number;
};

type Customer = {
  id: string;
  balance_owed: number;
};

export const dynamic = "force-dynamic";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const shopSettings = await getShopSettings();

  if (!shopSettings?.setup_completed) {
    redirect("/onboarding");
  }

  const currencyCode = shopSettings.currency_code || "USD";

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [salesResponse, saleItemsResponse, productsResponse, customersResponse] =
    await Promise.all([
      supabase
        .from("sales")
        .select(
          "id, customer_name, total_amount, amount_paid, balance_owed, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(10),

      supabase
        .from("sale_items")
        .select("id, sale_id, product_name, quantity")
        .order("created_at", { ascending: false }),

      supabase
        .from("products")
        .select("id, name, stock_quantity, low_stock_threshold")
        .order("stock_quantity", { ascending: true }),

      supabase.from("customers").select("id, balance_owed"),
    ]);

  const sales = (salesResponse.data || []) as Sale[];
  const saleItems = (saleItemsResponse.data || []) as SaleItem[];
  const products = (productsResponse.data || []) as Product[];
  const customers = (customersResponse.data || []) as Customer[];

  const todaySales = sales.filter(
    (sale) => new Date(sale.created_at) >= todayStart
  );

  const todayTotal = todaySales.reduce(
    (sum, sale) => sum + Number(sale.total_amount || 0),
    0
  );

  const todayPaid = todaySales.reduce(
    (sum, sale) => sum + Number(sale.amount_paid || 0),
    0
  );

  const totalOwed = customers.reduce(
    (sum, customer) => sum + Number(customer.balance_owed || 0),
    0
  );

  const customersOwing = customers.filter(
    (customer) => Number(customer.balance_owed || 0) > 0
  ).length;

  const lowStockProducts = products
    .filter(
      (product) =>
        Number(product.stock_quantity || 0) <=
        Number(product.low_stock_threshold || 0)
    )
    .slice(0, 5);

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
    <main className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="border-b border-slate-200 pb-6 dark:border-slate-800">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                OneShelf
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                {shopSettings.shop_name || "Shop dashboard"}
              </h1>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Real-time shop summary from your Supabase database.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle />
              <LogoutButton />

              <a
                href="/sales/new"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                New sale
              </a>
            </div>
          </div>

          <AppNav />
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Today’s sales
            </p>
            <p className="mt-3 text-3xl font-bold">
              {formatMoney(todayTotal, currencyCode)}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {todaySales.length} sale today
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Cash collected
            </p>
            <p className="mt-3 text-3xl font-bold">
              {formatMoney(todayPaid, currencyCode)}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              From today’s sales
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Customers owing
            </p>
            <p className="mt-3 text-3xl font-bold">{customersOwing}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {formatMoney(totalOwed, currencyCode)} total owed
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Low stock items
            </p>
            <p className="mt-3 text-3xl font-bold">{lowStockProducts.length}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Restock soon
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Recent sales</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Loaded from Supabase
                </p>
              </div>

              <a
                href="/sales/new"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                New sale
              </a>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-400">
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
                    <tr className="border-t border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-5 text-slate-500" colSpan={6}>
                        No sales yet. Create your first sale.
                      </td>
                    </tr>
                  ) : (
                    sales.map((sale) => (
                      <tr
                        key={sale.id}
                        className="border-t border-slate-200 dark:border-slate-800"
                      >
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                          {formatDate(sale.created_at)}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {sale.customer_name}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {getSaleItemSummary(sale.id)}
                        </td>
                        <td className="px-4 py-3">
                          {formatMoney(sale.total_amount, currencyCode)}
                        </td>
                        <td className="px-4 py-3 text-emerald-700 dark:text-emerald-400">
                          {formatMoney(sale.amount_paid, currencyCode)}
                        </td>
                        <td className="px-4 py-3 text-amber-700 dark:text-amber-400">
                          {formatMoney(sale.balance_owed, currencyCode)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold">Low stock</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Products to restock
            </p>

            <div className="mt-5 grid gap-3">
              {lowStockProducts.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                  No low stock products.
                </div>
              ) : (
                lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <p className="font-semibold">{product.name}</p>
                    <p className="mt-1 text-sm font-medium text-amber-700 dark:text-amber-400">
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
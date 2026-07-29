import AppNav from "@/components/AppNav";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

type Sale = {
  id: string;
  total_amount: number;
  amount_paid: number;
  balance_owed: number;
  created_at: string;
};

type SaleItem = {
  id: string;
  sale_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

type Product = {
  id: string;
  name: string;
  cost_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
};

export const dynamic = "force-dynamic";

function formatMoney(amount: number) {
  return `$${Number(amount || 0).toLocaleString()}`;
}

function formatDateInput(date: Date) {
  return date.toISOString().split("T")[0];
}

function startOfDay(date: Date) {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

function endOfDay(date: Date) {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
}

function addDays(date: Date, days: number) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

function startOfWeekMonday(date: Date) {
  const newDate = startOfDay(date);
  const day = newDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  newDate.setDate(newDate.getDate() + diff);
  return newDate;
}

function startOfMonth(date: Date) {
  const newDate = startOfDay(date);
  newDate.setDate(1);
  return newDate;
}

function getReportRange({
  period,
  selectedDate,
  customStart,
  customEnd,
}: {
  period: string;
  selectedDate: string;
  customStart: string;
  customEnd: string;
}) {
  const now = new Date();
  const today = startOfDay(now);
  const yesterday = addDays(today, -1);

  if (period === "yesterday") {
    return {
      label: "Yesterday",
      start: startOfDay(yesterday),
      end: endOfDay(yesterday),
    };
  }

  if (period === "week") {
    return {
      label: "This week",
      start: startOfWeekMonday(now),
      end: now,
    };
  }

  if (period === "month") {
    return {
      label: "This month",
      start: startOfMonth(now),
      end: now,
    };
  }

  if (period === "day" && selectedDate) {
    const date = new Date(`${selectedDate}T00:00:00`);

    return {
      label: `Selected day: ${selectedDate}`,
      start: startOfDay(date),
      end: endOfDay(date),
    };
  }

  if (period === "custom" && customStart && customEnd) {
    const start = new Date(`${customStart}T00:00:00`);
    const end = new Date(`${customEnd}T00:00:00`);

    return {
      label: `Custom: ${customStart} to ${customEnd}`,
      start: startOfDay(start),
      end: endOfDay(end),
    };
  }

  return {
    label: "Today",
    start: today,
    end: now,
  };
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    period?: string;
    date?: string;
    start?: string;
    end?: string;
  }>;
}) {
  const params = await searchParams;

  const period = params.period || "today";
  const selectedDate = params.date || formatDateInput(new Date());
  const customStart = params.start || formatDateInput(new Date());
  const customEnd = params.end || formatDateInput(new Date());

  const reportRange = getReportRange({
    period,
    selectedDate,
    customStart,
    customEnd,
  });

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [salesResponse, saleItemsResponse, productsResponse] =
    await Promise.all([
      supabase
        .from("sales")
        .select("id, total_amount, amount_paid, balance_owed, created_at")
        .order("created_at", { ascending: false }),

      supabase
        .from("sale_items")
        .select(
          "id, sale_id, product_id, product_name, quantity, unit_price, total_price"
        )
        .order("created_at", { ascending: false }),

      supabase
        .from("products")
        .select("id, name, cost_price, stock_quantity, low_stock_threshold")
        .order("stock_quantity", { ascending: true }),
    ]);

  const error =
    salesResponse.error || saleItemsResponse.error || productsResponse.error;

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
        <p className="text-xl font-bold">Could not load reports.</p>
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error.message}
        </p>
      </main>
    );
  }

  const sales = (salesResponse.data || []) as Sale[];
  const saleItems = (saleItemsResponse.data || []) as SaleItem[];
  const products = (productsResponse.data || []) as Product[];

  const filteredSales = sales.filter((sale) => {
    const saleDate = new Date(sale.created_at);
    return saleDate >= reportRange.start && saleDate <= reportRange.end;
  });

  const filteredSaleIds = new Set(filteredSales.map((sale) => sale.id));

  const filteredSaleItems = saleItems.filter((item) =>
    filteredSaleIds.has(item.sale_id)
  );

  const totalSales = filteredSales.reduce(
    (sum, sale) => sum + Number(sale.total_amount || 0),
    0
  );

  const totalCollected = filteredSales.reduce(
    (sum, sale) => sum + Number(sale.amount_paid || 0),
    0
  );

  const totalUnpaid = filteredSales.reduce(
    (sum, sale) => sum + Number(sale.balance_owed || 0),
    0
  );

  const productCostMap = new Map(
    products.map((product) => [product.id, Number(product.cost_price || 0)])
  );

  const estimatedProfit = filteredSaleItems.reduce((sum, item) => {
    const costPrice = item.product_id
      ? Number(productCostMap.get(item.product_id) || 0)
      : 0;

    const itemProfit =
      Number(item.total_price || 0) - costPrice * Number(item.quantity || 0);

    return sum + itemProfit;
  }, 0);

  const productReportMap = new Map<
    string,
    {
      productName: string;
      quantity: number;
      revenue: number;
    }
  >();

  filteredSaleItems.forEach((item) => {
    const existing = productReportMap.get(item.product_name);

    if (existing) {
      existing.quantity += Number(item.quantity || 0);
      existing.revenue += Number(item.total_price || 0);
    } else {
      productReportMap.set(item.product_name, {
        productName: item.product_name,
        quantity: Number(item.quantity || 0),
        revenue: Number(item.total_price || 0),
      });
    }
  });

  const bestSellingProducts = Array.from(productReportMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const lowStockProducts = products
    .filter(
      (product) =>
        Number(product.stock_quantity || 0) <=
        Number(product.low_stock_threshold || 0)
    )
    .slice(0, 5);

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
                Reports
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Select a time period and review sales, profit, balances, best
                sellers, and stock alerts from one clean workspace.
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
                  href="/sales/new"
                  className="flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  + New sale
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <AppNav />
          </div>
        </header>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Report period</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Current report: {reportRange.label}
            </p>
          </div>

          <form className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto_auto]">
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Period
              </span>
              <select
                name="period"
                defaultValue={period}
                className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="day">Select day</option>
                <option value="custom">Custom range</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Select day
              </span>
              <input
                type="date"
                name="date"
                defaultValue={selectedDate}
                className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Custom start
              </span>
              <input
                type="date"
                name="start"
                defaultValue={customStart}
                className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Custom end
              </span>
              <input
                type="date"
                name="end"
                defaultValue={customEnd}
                className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </label>

            <button
              type="submit"
              className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 lg:self-end"
            >
              Apply
            </button>

            <a
              href="/reports"
              className="flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 lg:self-end"
            >
              Clear
            </a>
          </form>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Sales total
            </p>
            <p className="mt-3 text-3xl font-bold">{formatMoney(totalSales)}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {filteredSales.length} sales in this period
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Cash collected
            </p>
            <p className="mt-3 text-3xl font-bold text-emerald-700 dark:text-emerald-400">
              {formatMoney(totalCollected)}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Paid amount in this period
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Unpaid balance
            </p>
            <p className="mt-3 text-3xl font-bold text-amber-700 dark:text-amber-400">
              {formatMoney(totalUnpaid)}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Balance created in this period
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Estimated profit
            </p>
            <p className="mt-3 text-3xl font-bold">
              {formatMoney(estimatedProfit)}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Based on current cost prices
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <div>
              <h2 className="text-lg font-semibold">Best-selling products</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Ranked by quantity sold in selected period
              </p>
            </div>

            <div className="mt-5 grid gap-3 md:hidden">
              {bestSellingProducts.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                  No sales in this period.
                </div>
              ) : (
                bestSellingProducts.map((product, index) => (
                  <div
                    key={product.productName}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400">
                          #{index + 1} Best seller
                        </p>
                        <h3 className="mt-1 font-semibold">
                          {product.productName}
                        </h3>
                      </div>

                      <p className="font-bold">{product.quantity} sold</p>
                    </div>

                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                      Revenue
                    </p>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                      {formatMoney(product.revenue)}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 hidden overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Qty sold</th>
                    <th className="px-4 py-3">Revenue</th>
                  </tr>
                </thead>

                <tbody>
                  {bestSellingProducts.length === 0 ? (
                    <tr className="border-t border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-5 text-slate-500" colSpan={3}>
                        No sales in this period.
                      </td>
                    </tr>
                  ) : (
                    bestSellingProducts.map((product) => (
                      <tr
                        key={product.productName}
                        className="border-t border-slate-200 dark:border-slate-800"
                      >
                        <td className="px-4 py-3 font-semibold">
                          {product.productName}
                        </td>
                        <td className="px-4 py-3">{product.quantity}</td>
                        <td className="px-4 py-3">
                          {formatMoney(product.revenue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <div>
              <h2 className="text-lg font-semibold">Low-stock products</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Products that need restocking now
              </p>
            </div>

            <div className="mt-5 grid gap-3">
              {lowStockProducts.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                  No low-stock products.
                </div>
              ) : (
                lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 sm:flex sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Alert level: {product.low_stock_threshold}
                      </p>
                    </div>

                    <p className="mt-3 font-bold text-amber-700 dark:text-amber-400 sm:mt-0">
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
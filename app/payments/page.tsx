import AppNav from "@/components/AppNav";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import { formatMoney } from "@/lib/currency";
import { getShopSettings } from "@/lib/shopSettingsServer";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

type CustomerPayment = {
  id: string;
  customer_name: string;
  amount: number;
  notes: string | null;
  created_at: string;
};

export const dynamic = "force-dynamic";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function PaymentsPage() {
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

  const { data, error } = await supabase
    .from("customer_payments")
    .select("id, customer_name, amount, notes, created_at")
    .order("created_at", { ascending: false });

  const payments = (data || []) as CustomerPayment[];

  const totalPayments = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayPayments = payments.filter(
    (payment) => new Date(payment.created_at) >= todayStart
  );

  const todayTotal = todayPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
        <p className="text-xl font-bold">Could not load payments.</p>

        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error.message}
        </p>

        <pre className="mt-4 overflow-auto rounded-xl bg-slate-900 p-4 text-sm text-white">
          {JSON.stringify(error, null, 2)}
        </pre>
      </main>
    );
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
                Payment history
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Review customer balance payments, payment notes, and daily cash
                collected from one clean workspace.
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
                  href="/customers"
                  className="flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Customers
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <AppNav />
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total payments
            </p>
            <p className="mt-3 text-3xl font-bold">
              {formatMoney(totalPayments, currencyCode)}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              All recorded payments
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Today’s payments
            </p>
            <p className="mt-3 text-3xl font-bold text-emerald-700 dark:text-emerald-400">
              {formatMoney(todayTotal, currencyCode)}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {todayPayments.length} payments today
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Payment records
            </p>
            <p className="mt-3 text-3xl font-bold">{payments.length}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Saved entries
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div>
            <h2 className="text-lg font-semibold">All customer payments</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing {payments.length} payment records
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:hidden">
            {payments.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                No payments recorded yet.
              </div>
            ) : (
              payments.map((payment) => (
                <div
                  key={payment.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">
                        {payment.customer_name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(payment.created_at)}
                      </p>
                    </div>

                    <p className="font-bold text-emerald-700 dark:text-emerald-400">
                      {formatMoney(payment.amount, currencyCode)}
                    </p>
                  </div>

                  {payment.notes ? (
                    <p className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                      {payment.notes}
                    </p>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                      No notes
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="mt-5 hidden overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>

              <tbody>
                {payments.length === 0 ? (
                  <tr className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-4 py-5 text-slate-500" colSpan={4}>
                      No payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-t border-slate-200 dark:border-slate-800"
                    >
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {formatDate(payment.created_at)}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {payment.customer_name}
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-400">
                        {formatMoney(payment.amount, currencyCode)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {payment.notes || "No notes"}
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
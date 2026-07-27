import AppNav from "@/components/AppNav";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type CustomerPayment = {
  id: string;
  customer_name: string;
  amount: number;
  notes: string | null;
  created_at: string;
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

export default async function PaymentsPage() {
  const supabase = await createSupabaseServerClient();

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
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="border-b border-slate-200 pb-6 dark:border-slate-800">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                OneShelf
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Payment history
              </h1>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Review customer balance payments and payment notes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle />
              <LogoutButton />

              <a
                href="/customers"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Customers
              </a>
            </div>
          </div>

          <AppNav />
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total payments
            </p>
            <p className="mt-3 text-3xl font-bold">
              {formatMoney(totalPayments)}
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
              {formatMoney(todayTotal)}
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

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h2 className="text-lg font-semibold">All customer payments</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loaded from Supabase
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
                      {formatMoney(payment.amount)}
                    </p>
                  </div>

                  {payment.notes ? (
                    <p className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                      {payment.notes}
                    </p>
                  ) : null}
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
                        {formatMoney(payment.amount)}
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
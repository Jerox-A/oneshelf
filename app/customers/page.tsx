import AppNav from "@/components/AppNav";
import DeleteCustomerButton from "@/components/DeleteCustomerButton";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type Customer = {
  id: string;
  name: string;
  phone: string | null;
  balance_owed: number;
  last_purchase_at: string | null;
  created_at: string;
};

export const dynamic = "force-dynamic";

function formatMoney(amount: number) {
  return `$${Number(amount || 0).toLocaleString()}`;
}

function formatDate(dateString: string | null) {
  if (!dateString) {
    return "No purchases yet";
  }

  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function CustomersPage() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("customers")
    .select("id, name, phone, balance_owed, last_purchase_at, created_at")
    .order("created_at", { ascending: false });

  const customers = (data || []) as Customer[];

  const totalCustomers = customers.length;

  const customersOwing = customers.filter(
    (customer) => Number(customer.balance_owed || 0) > 0
  );

  const totalOwed = customers.reduce(
    (sum, customer) => sum + Number(customer.balance_owed || 0),
    0
  );

  const clearCustomers = customers.filter(
    (customer) => Number(customer.balance_owed || 0) === 0
  ).length;

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
        <p className="text-xl font-bold">Could not load customers.</p>

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
                Customers
              </h1>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Track customer balances, contact details, and recent activity.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle />
              <LogoutButton />

              <a
                href="/customers/new"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Add customer
              </a>
            </div>
          </div>

          <AppNav />
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Customers
            </p>
            <p className="mt-3 text-3xl font-bold">{totalCustomers}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Saved customer records
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Customers owing
            </p>
            <p className="mt-3 text-3xl font-bold">
              {customersOwing.length}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Have unpaid balances
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total owed
            </p>
            <p className="mt-3 text-3xl font-bold">{formatMoney(totalOwed)}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Outstanding customer debt
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Clear accounts
            </p>
            <p className="mt-3 text-3xl font-bold">{clearCustomers}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              No balance owed
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Customer list</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loaded from Supabase
              </p>
            </div>

            <a
              href="/customers/new"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Add customer
            </a>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Balance owed</th>
                  <th className="px-4 py-3">Last purchase</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {customers.length === 0 ? (
                  <tr className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-4 py-5 text-slate-500" colSpan={6}>
                      No customers loaded.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => {
                    const hasBalance =
                      Number(customer.balance_owed || 0) > 0;

                    return (
                      <tr
                        key={customer.id}
                        className="border-t border-slate-200 dark:border-slate-800"
                      >
                        <td className="px-4 py-3 font-semibold">
                          {customer.name}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {customer.phone || "No phone"}
                        </td>
                        <td className="px-4 py-3">
                          {formatMoney(customer.balance_owed)}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {formatDate(customer.last_purchase_at)}
                        </td>
                        <td className="px-4 py-3">
                          {hasBalance ? (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              Owes balance
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Clear
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={`/customers/${customer.id}`}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              Edit
                            </a>

                            <DeleteCustomerButton
                              customerId={customer.id}
                              customerName={customer.name}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
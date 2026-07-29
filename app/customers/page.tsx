import AppNav from "@/components/AppNav";
import DeleteCustomerButton from "@/components/DeleteCustomerButton";
import LogoutButton from "@/components/LogoutButton";
import RecordCustomerPaymentButton from "@/components/RecordCustomerPaymentButton";
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

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    balance?: string;
  }>;
}) {
  const params = await searchParams;

  const search = params.q || "";
  const selectedBalance = params.balance || "all";

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("customers")
    .select("id, name, phone, balance_owed, last_purchase_at, created_at")
    .order("created_at", { ascending: false });

  const customers = (data || []) as Customer[];

  const filteredCustomers = customers.filter((customer) => {
    const balanceOwed = Number(customer.balance_owed || 0);

    const matchesSearch =
      search.trim() === "" ||
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      (customer.phone || "").toLowerCase().includes(search.toLowerCase());

    const matchesBalance =
      selectedBalance === "all" ||
      (selectedBalance === "owes" && balanceOwed > 0) ||
      (selectedBalance === "clear" && balanceOwed === 0);

    return matchesSearch && matchesBalance;
  });

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
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
                <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                OneShelf
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Customers
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Search customers, track balances, record payments, and manage
                customer records from one clean workspace.
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
                  href="/customers/new"
                  className="flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  + Add customer
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <AppNav />
          </div>
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
            <p className="mt-3 text-3xl font-bold">{customersOwing.length}</p>
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

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Customer list</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing {filteredCustomers.length} of {customers.length}{" "}
                customers
              </p>
            </div>

            <a
              href="/customers/new"
              className="rounded-xl bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Add customer
            </a>
          </div>

          <form className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_auto_auto]">
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Search
              </span>
              <input
                name="q"
                defaultValue={search}
                placeholder="Search customer or phone"
                className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Balance
              </span>
              <select
                name="balance"
                defaultValue={selectedBalance}
                className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="all">All customers</option>
                <option value="owes">Owes balance</option>
                <option value="clear">Clear account</option>
              </select>
            </label>

            <button
              type="submit"
              className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 lg:self-end"
            >
              Apply
            </button>

            <a
              href="/customers"
              className="flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 lg:self-end"
            >
              Clear
            </a>
          </form>

          <div className="mt-5 grid gap-4 md:hidden">
            {filteredCustomers.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                No customers match your search or filters.
              </div>
            ) : (
              filteredCustomers.map((customer) => {
                const balanceOwed = Number(customer.balance_owed || 0);
                const hasBalance = balanceOwed > 0;

                return (
                  <div
                    key={customer.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{customer.name}</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {customer.phone || "No phone"}
                        </p>
                      </div>

                      {hasBalance ? (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Owes
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Clear
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">
                          Balance owed
                        </p>
                        <p
                          className={
                            hasBalance
                              ? "font-semibold text-amber-700 dark:text-amber-400"
                              : "font-semibold text-emerald-700 dark:text-emerald-400"
                          }
                        >
                          {formatMoney(balanceOwed)}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-500 dark:text-slate-400">
                          Last purchase
                        </p>
                        <p className="font-semibold">
                          {formatDate(customer.last_purchase_at)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <RecordCustomerPaymentButton
                        customerId={customer.id}
                        customerName={customer.name}
                        currentBalance={balanceOwed}
                      />

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
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-5 hidden overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 md:block">
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
                {filteredCustomers.length === 0 ? (
                  <tr className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-4 py-5 text-slate-500" colSpan={6}>
                      No customers match your search or filters.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => {
                    const balanceOwed = Number(customer.balance_owed || 0);
                    const hasBalance = balanceOwed > 0;

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
                          {formatMoney(balanceOwed)}
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
                            <RecordCustomerPaymentButton
                              customerId={customer.id}
                              customerName={customer.name}
                              currentBalance={balanceOwed}
                            />

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
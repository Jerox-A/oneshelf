import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: string;
  name: string;
  phone: string | null;
  balance_owed: number;
  last_purchase_at: string | null;
};

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const { data: customers, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <p>Could not load customers.</p>
        <p className="mt-2 text-sm text-red-300">{error.message}</p>
      </main>
    );
  }

  const customerList = (customers || []) as Customer[];

  const totalCustomers = customerList.length;
  const customersOwing = customerList.filter(
    (customer) => Number(customer.balance_owed) > 0
  ).length;
  const totalOwed = customerList.reduce(
    (sum, customer) => sum + Number(customer.balance_owed || 0),
    0
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="border-b border-slate-800 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-emerald-300">OneShelf</p>
              <h1 className="mt-1 text-3xl font-bold">Customers</h1>
              <p className="mt-2 text-sm text-slate-400">
                Track customer balances, phone numbers, and who still owes you.
              </p>
            </div>

            <a
              href="/customers/new"
              className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Add customer
            </a>
          </div>

          <AppNav />
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total customers</p>
            <p className="mt-3 text-3xl font-bold">{totalCustomers}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Customers owing</p>
            <p className="mt-3 text-3xl font-bold text-amber-300">
              {customersOwing}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total owed</p>
            <p className="mt-3 text-3xl font-bold">${totalOwed}</p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Customer list</h2>
              <p className="text-sm text-slate-400">Loaded from Supabase</p>
            </div>

            <a
              href="/customers/new"
              className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Add customer
            </a>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Balance owed</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {customerList.map((customer) => {
                  const owesMoney = Number(customer.balance_owed) > 0;

                  return (
                    <tr key={customer.id} className="border-t border-slate-800">
                      <td className="px-4 py-3 font-semibold">
                        {customer.name}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {customer.phone || "No phone"}
                      </td>
                      <td className="px-4 py-3 text-amber-300">
                        ${customer.balance_owed}
                      </td>
                      <td className="px-4 py-3">
                        {owesMoney ? (
                          <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                            Owes money
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                            Clear
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
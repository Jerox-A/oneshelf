import AppNav from "@/components/AppNav";
const customers = [
    {
      name: "Mary Johnson",
      phone: "+234 801 234 5678",
      owed: "$4",
      lastPurchase: "Rice x 2",
      status: "Owes money",
    },
    {
      name: "John Mensah",
      phone: "+233 24 555 0192",
      owed: "$0",
      lastPurchase: "Soap x 3",
      status: "Paid",
    },
    {
      name: "Amina Yusuf",
      phone: "+234 809 876 5432",
      owed: "$12",
      lastPurchase: "Sugar x 1",
      status: "Owes money",
    },
    {
      name: "David Okoro",
      phone: "+234 802 111 9090",
      owed: "$0",
      lastPurchase: "Cooking Oil x 1",
      status: "Paid",
    },
  ];
  
  export default function CustomersPage() {
    const totalCustomers = customers.length;
    const owingCustomers = customers.filter(
      (customer) => customer.status === "Owes money"
    ).length;
  
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <header className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-emerald-300">OneShelf</p>
              <h1 className="mt-1 text-3xl font-bold">Customers</h1>
              <p className="mt-2 text-sm text-slate-400">
                Track repeat customers, balances, and payment history.
              </p>
            </div>
  
            <div className="flex gap-3">
              <a
                href="/dashboard"
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200"
              >
                Dashboard
              </a>
  
              <button className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950">
                Add customer
              </button>
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
                {owingCustomers}
              </p>
            </div>
  
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Total owed</p>
              <p className="mt-3 text-3xl font-bold">$16</p>
            </div>
          </section>
  
          <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Customer list</h2>
              <p className="text-sm text-slate-400">
                Simple credit tracking for small shops
              </p>
            </div>
  
            <div className="mt-5 overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Last purchase</th>
                    <th className="px-4 py-3">Owed</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
  
                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.phone}
                      className="border-t border-slate-800"
                    >
                      <td className="px-4 py-3 font-semibold">
                        {customer.name}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {customer.phone}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {customer.lastPurchase}
                      </td>
                      <td className="px-4 py-3 text-amber-300">
                        {customer.owed}
                      </td>
                      <td className="px-4 py-3">
                        {customer.status === "Paid" ? (
                          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                            Paid
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                            Owes money
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`https://wa.me/${customer.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          className="text-emerald-300 underline"
                        >
                          WhatsApp
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    );
  }
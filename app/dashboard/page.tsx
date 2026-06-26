const stats = [
  {
    label: "Today’s sales",
    value: "$248",
    helper: "12 sales recorded today",
  },
  {
    label: "Cash collected",
    value: "$190",
    helper: "$58 still unpaid",
  },
  {
    label: "Customers owing",
    value: "7",
    helper: "3 customers overdue",
  },
  {
    label: "Low stock items",
    value: "5",
    helper: "Restock soon",
  },
];

const recentSales = [
  {
    customer: "Mary",
    item: "Rice x 2",
    total: "$24",
    paid: "$20",
    balance: "$4",
  },
  {
    customer: "John",
    item: "Soap x 3",
    total: "$9",
    paid: "$9",
    balance: "$0",
  },
  {
    customer: "Amina",
    item: "Sugar x 1",
    total: "$12",
    paid: "$0",
    balance: "$12",
  },
];

const lowStock = [
  {
    name: "Rice",
    stock: "4 bags left",
  },
  {
    name: "Soap",
    stock: "6 bars left",
  },
  {
    name: "Sugar",
    stock: "3 packs left",
  },
];

const navLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
  },
  {
    href: "/products",
    label: "Products",
  },
  {
    href: "/customers",
    label: "Customers",
  },
  {
    href: "/sales/new",
    label: "New Sale",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <header className="border-b border-slate-800 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-emerald-300">OneShelf</p>
              <h1 className="mt-1 text-3xl font-bold">Shop dashboard</h1>
              <p className="mt-2 text-sm text-slate-400">
                Track sales, stock, payments, and customer balances.
              </p>
            </div>

            <a
              href="/"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200"
            >
              Back to home
            </a>
          </div>

          <nav className="mt-6 flex flex-wrap gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
              >
                {link.label}
              </a>
            ))}
          </nav>
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
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent sales</h2>

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
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Paid</th>
                    <th className="px-4 py-3">Balance</th>
                  </tr>
                </thead>

                <tbody>
                  {recentSales.map((sale) => (
                    <tr
                      key={`${sale.customer}-${sale.item}`}
                      className="border-t border-slate-800"
                    >
                      <td className="px-4 py-3">{sale.customer}</td>
                      <td className="px-4 py-3 text-slate-300">
                        {sale.item}
                      </td>
                      <td className="px-4 py-3">{sale.total}</td>
                      <td className="px-4 py-3 text-emerald-300">
                        {sale.paid}
                      </td>
                      <td className="px-4 py-3 text-amber-300">
                        {sale.balance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold">Low stock</h2>

            <div className="mt-5 space-y-3">
              {lowStock.map((item) => (
                <div
                  key={item.name}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                >
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 text-sm text-amber-300">{item.stock}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
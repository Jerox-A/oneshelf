const appLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "See sales, cash, debt, and low stock.",
  },
  {
    href: "/products",
    label: "Products",
    description: "Manage prices, stock, and product status.",
  },
  {
    href: "/customers",
    label: "Customers",
    description: "Track repeat customers and who owes money.",
  },
  {
    href: "/sales/new",
    label: "New Sale",
    description: "Record a sale, payment, and balance owed.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold">OneShelf</p>
            <p className="text-sm text-slate-400">For small retail shops</p>
          </div>

          <a
            href="/dashboard"
            className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Open demo
          </a>
        </header>

        <section className="flex min-h-[70vh] flex-col items-center justify-center text-center">
          <div className="mb-6 rounded-full bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
            Simple shop management from your phone
          </div>

          <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl">
            Know what&apos;s sold, what&apos;s left, and who owes you.
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            OneShelf helps small shop owners track sales, stock, customers,
            payments, and receipts without messy notebooks or spreadsheets.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="/dashboard"
              className="rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-slate-950"
            >
              Open demo dashboard
            </a>

            <a
              href="#features"
              className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white"
            >
              See features
            </a>
          </div>
        </section>

        <section
          id="features"
          className="grid gap-4 border-t border-slate-800 py-10 sm:grid-cols-2 lg:grid-cols-4"
        >
          {appLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5 hover:bg-slate-800"
            >
              <h2 className="font-semibold">{link.label}</h2>
              <p className="mt-2 text-sm text-slate-400">
                {link.description}
              </p>
            </a>
          ))}
        </section>
      </section>
    </main>
  );
}
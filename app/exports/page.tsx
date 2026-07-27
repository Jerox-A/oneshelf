import AppNav from "@/components/AppNav";
import ExportCsvButton from "@/components/ExportCsvButton";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

export default function ExportsPage() {
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
                Exports
              </h1>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Download your products, customers, and sales as CSV files for
                Excel or Google Sheets.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>

          <AppNav />
        </header>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold">Products</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Export product names, categories, prices, stock quantities, and
              low-stock thresholds.
            </p>

            <div className="mt-6">
              <ExportCsvButton type="products" label="Export products CSV" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold">Customers</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Export customer names, phone numbers, balances, and purchase
              dates.
            </p>

            <div className="mt-6">
              <ExportCsvButton type="customers" label="Export customers CSV" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold">Sales</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Export sales with customer names, sold items, totals, paid
              amounts, balances, and payment methods.
            </p>

            <div className="mt-6">
              <ExportCsvButton type="sales" label="Export sales CSV" />
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">How to use exports</h2>

          <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-400">
            <p>
              CSV files can be opened in Microsoft Excel, Google Sheets, Apple
              Numbers, or uploaded into accounting tools.
            </p>

            <p>
              Export regularly if you want an offline backup of your shop data.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
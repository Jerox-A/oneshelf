import AppNav from "@/components/AppNav";
import ExportCsvButton from "@/components/ExportCsvButton";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import { getShopSettings } from "@/lib/shopSettingsServer";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ExportsPage() {
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
                Exports
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Download your products, customers, sales, and payments as CSV
                files for Excel, Google Sheets, backups, or accounting.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-inner dark:border-slate-800 dark:bg-slate-950">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-xl bg-white p-1 shadow-sm dark:bg-slate-900">
                  <ThemeToggle />
                </div>

                <div className="rounded-xl bg-white p-1 shadow-sm dark:bg-slate-900">
                  <LogoutButton />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <AppNav />
          </div>
        </header>

        <section className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl dark:bg-blue-950">
              📦
            </div>

            <h2 className="mt-5 text-lg font-semibold">Products</h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Export product names, categories, prices, stock quantities, and
              low-stock thresholds.
            </p>

            <div className="mt-6">
              <ExportCsvButton type="products" label="Export products CSV" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl dark:bg-emerald-950">
              👥
            </div>

            <h2 className="mt-5 text-lg font-semibold">Customers</h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Export customer names, phone numbers, balances, and purchase
              dates.
            </p>

            <div className="mt-6">
              <ExportCsvButton type="customers" label="Export customers CSV" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-xl dark:bg-amber-950">
              🧾
            </div>

            <h2 className="mt-5 text-lg font-semibold">Sales</h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Export sales with customer names, sold items, totals, currency,
              paid amounts, balances, and payment methods.
            </p>

            <div className="mt-6">
              <ExportCsvButton type="sales" label="Export sales CSV" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-xl dark:bg-purple-950">
              💵
            </div>

            <h2 className="mt-5 text-lg font-semibold">Payments</h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Export customer payment records with names, amounts, notes, and
              payment dates.
            </p>

            <div className="mt-6">
              <ExportCsvButton type="payments" label="Export payments CSV" />
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
            <div>
              <h2 className="text-lg font-semibold">How to use exports</h2>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                CSV files can be opened in Microsoft Excel, Google Sheets,
                Apple Numbers, or uploaded into accounting tools.
              </p>
            </div>

            <div className="grid gap-3 text-sm">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="font-semibold">Backup your data</p>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  Export regularly if you want an offline copy of your shop
                  records.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="font-semibold">Use in spreadsheets</p>
                <p className="mt-1 text-slate-500 dark:text-slate-400">
                  Open the CSV file in Excel or Google Sheets to sort, filter,
                  print, or share reports.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
import AppNav from "@/components/AppNav";
import DeleteProductButton from "@/components/DeleteProductButton";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type Product = {
  id: string;
  name: string;
  category: string;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
};

export const dynamic = "force-dynamic";

function formatMoney(amount: number) {
  return `$${Number(amount || 0).toLocaleString()}`;
}

export default async function ProductsPage() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, category, cost_price, selling_price, stock_quantity, low_stock_threshold"
    )
    .order("created_at", { ascending: false });

  const products = (data || []) as Product[];

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.stock_quantity || 0),
    0
  );

  const lowStockProducts = products.filter(
    (product) =>
      Number(product.stock_quantity || 0) <=
      Number(product.low_stock_threshold || 0)
  );

  const stockValue = products.reduce(
    (sum, product) =>
      sum +
      Number(product.stock_quantity || 0) * Number(product.cost_price || 0),
    0
  );

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
        <p className="text-xl font-bold">Could not load products.</p>

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
                Products
              </h1>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Manage inventory, prices, stock levels, and restock alerts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle />
              <LogoutButton />

              <a
                href="/products/new"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Add product
              </a>
            </div>
          </div>

          <AppNav />
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Products
            </p>
            <p className="mt-3 text-3xl font-bold">{totalProducts}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Active items
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total stock
            </p>
            <p className="mt-3 text-3xl font-bold">{totalStock}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Units available
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Low stock
            </p>
            <p className="mt-3 text-3xl font-bold">
              {lowStockProducts.length}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Need attention
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Stock value
            </p>
            <p className="mt-3 text-3xl font-bold">{formatMoney(stockValue)}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Based on cost price
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Inventory list</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loaded from Supabase
              </p>
            </div>

            <a
              href="/products/new"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Add product
            </a>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Cost</th>
                  <th className="px-4 py-3">Selling price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.length === 0 ? (
                  <tr className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-4 py-5 text-slate-500" colSpan={7}>
                      No products loaded.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const isLowStock =
                      Number(product.stock_quantity || 0) <=
                      Number(product.low_stock_threshold || 0);

                    return (
                      <tr
                        key={product.id}
                        className="border-t border-slate-200 dark:border-slate-800"
                      >
                        <td className="px-4 py-3 font-semibold">
                          {product.name}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {product.category}
                        </td>
                        <td className="px-4 py-3">
                          {formatMoney(product.cost_price)}
                        </td>
                        <td className="px-4 py-3">
                          {formatMoney(product.selling_price)}
                        </td>
                        <td className="px-4 py-3">
                          {product.stock_quantity}
                        </td>
                        <td className="px-4 py-3">
                          {isLowStock ? (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              Low stock
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              In stock
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={`/products/${product.id}`}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              Edit
                            </a>

                            <DeleteProductButton
                              productId={product.id}
                              productName={product.name}
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
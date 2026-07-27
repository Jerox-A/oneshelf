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

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    stock?: string;
  }>;
}) {
  const params = await searchParams;

  const search = params.q || "";
  const selectedCategory = params.category || "all";
  const selectedStock = params.stock || "all";

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, category, cost_price, selling_price, stock_quantity, low_stock_threshold"
    )
    .order("created_at", { ascending: false });

  const products = (data || []) as Product[];

  const categories = Array.from(
    new Set(products.map((product) => product.category).filter(Boolean))
  ).sort();

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      search.trim() === "" ||
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;

    const stockQuantity = Number(product.stock_quantity || 0);
    const lowStockThreshold = Number(product.low_stock_threshold || 0);

    const isOutOfStock = stockQuantity === 0;
    const isLowStock = stockQuantity > 0 && stockQuantity <= lowStockThreshold;
    const isInStock = stockQuantity > lowStockThreshold;

    const matchesStock =
      selectedStock === "all" ||
      (selectedStock === "in-stock" && isInStock) ||
      (selectedStock === "low-stock" && isLowStock) ||
      (selectedStock === "out-of-stock" && isOutOfStock);

    return matchesSearch && matchesCategory && matchesStock;
  });

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.stock_quantity || 0),
    0
  );

  const lowStockProducts = products.filter(
    (product) =>
      Number(product.stock_quantity || 0) > 0 &&
      Number(product.stock_quantity || 0) <=
        Number(product.low_stock_threshold || 0)
  );

  const outOfStockProducts = products.filter(
    (product) => Number(product.stock_quantity || 0) === 0
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
                Search inventory, filter stock, update products, and manage
                prices.
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
              Low / out stock
            </p>
            <p className="mt-3 text-3xl font-bold">
              {lowStockProducts.length + outOfStockProducts.length}
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Inventory list</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>

            <a
              href="/products/new"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Add product
            </a>
          </div>

          <form className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto_auto]">
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Search
              </span>
              <input
                name="q"
                defaultValue={search}
                placeholder="Search product or category"
                className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Category
              </span>
              <select
                name="category"
                defaultValue={selectedCategory}
                className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Stock
              </span>
              <select
                name="stock"
                defaultValue={selectedStock}
                className="h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="all">All stock</option>
                <option value="in-stock">In stock</option>
                <option value="low-stock">Low stock</option>
                <option value="out-of-stock">Out of stock</option>
              </select>
            </label>

            <button
              type="submit"
              className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 lg:self-end"
            >
              Apply
            </button>

            <a
              href="/products"
              className="flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 lg:self-end"
            >
              Clear
            </a>
          </form>

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
                {filteredProducts.length === 0 ? (
                  <tr className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-4 py-5 text-slate-500" colSpan={7}>
                      No products match your search or filters.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const stockQuantity = Number(product.stock_quantity || 0);
                    const lowStockThreshold = Number(
                      product.low_stock_threshold || 0
                    );

                    const isOutOfStock = stockQuantity === 0;
                    const isLowStock =
                      stockQuantity > 0 && stockQuantity <= lowStockThreshold;

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
                        <td className="px-4 py-3">{stockQuantity}</td>
                        <td className="px-4 py-3">
                          {isOutOfStock ? (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 dark:bg-red-950 dark:text-red-300">
                              Out of stock
                            </span>
                          ) : isLowStock ? (
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
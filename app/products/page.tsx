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

  function getProductStatus(product: Product) {
    const stockQuantity = Number(product.stock_quantity || 0);
    const lowStockThreshold = Number(product.low_stock_threshold || 0);

    if (stockQuantity === 0) {
      return {
        label: "Out of stock",
        className:
          "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
      };
    }

    if (stockQuantity <= lowStockThreshold) {
      return {
        label: "Low stock",
        className:
          "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
      };
    }

    return {
      label: "In stock",
      className:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    };
  }

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
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
                <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                OneShelf
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Products
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Search inventory, filter stock, update products, and manage
                prices from one clean business workspace.
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
                  href="/products/new"
                  className="flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  + Add product
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

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Inventory list</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>

            <a
              href="/products/new"
              className="rounded-xl bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
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

          <div className="mt-5 grid gap-4 md:hidden">
            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                No products match your search or filters.
              </div>
            ) : (
              filteredProducts.map((product) => {
                const status = getProductStatus(product);

                return (
                  <div
                    key={product.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {product.category}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">
                          Cost
                        </p>
                        <p className="font-semibold">
                          {formatMoney(product.cost_price)}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-500 dark:text-slate-400">
                          Selling
                        </p>
                        <p className="font-semibold">
                          {formatMoney(product.selling_price)}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-500 dark:text-slate-400">
                          Stock
                        </p>
                        <p className="font-semibold">
                          {product.stock_quantity}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-500 dark:text-slate-400">
                          Alert
                        </p>
                        <p className="font-semibold">
                          {product.low_stock_threshold}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
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
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-5 hidden overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 md:block">
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
                    const status = getProductStatus(product);

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
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                          >
                            {status.label}
                          </span>
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
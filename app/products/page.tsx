import AppNav from "@/components/AppNav";
const products = [
    {
      name: "Rice",
      category: "Food",
      costPrice: "$8",
      sellingPrice: "$12",
      stock: 4,
      lowStock: true,
    },
    {
      name: "Soap",
      category: "Household",
      costPrice: "$2",
      sellingPrice: "$3",
      stock: 6,
      lowStock: true,
    },
    {
      name: "Sugar",
      category: "Food",
      costPrice: "$7",
      sellingPrice: "$10",
      stock: 3,
      lowStock: true,
    },
    {
      name: "Cooking Oil",
      category: "Food",
      costPrice: "$10",
      sellingPrice: "$14",
      stock: 18,
      lowStock: false,
    },
    {
      name: "Toothpaste",
      category: "Personal Care",
      costPrice: "$3",
      sellingPrice: "$5",
      stock: 22,
      lowStock: false,
    },
  ];
  
  export default function ProductsPage() {
    const totalProducts = products.length;
    const lowStockCount = products.filter((product) => product.lowStock).length;
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <header className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-emerald-300">OneShelf</p>
              <h1 className="mt-1 text-3xl font-bold">Products</h1>
              <p className="mt-2 text-sm text-slate-400">
                Manage product prices, stock levels, and low-stock alerts.
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
                Add product
              </button>
            </div>
            <AppNav />
          </header>
  
          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Total products</p>
              <p className="mt-3 text-3xl font-bold">{totalProducts}</p>
            </div>
  
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Total stock units</p>
              <p className="mt-3 text-3xl font-bold">{totalStock}</p>
            </div>
  
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">Low stock items</p>
              <p className="mt-3 text-3xl font-bold text-amber-300">
                {lowStockCount}
              </p>
            </div>
          </section>
  
          <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Product list</h2>
              <p className="text-sm text-slate-400">
                Simple stock view for small shops
              </p>
            </div>
  
            <div className="mt-5 overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Cost price</th>
                    <th className="px-4 py-3">Selling price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
  
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.name}
                      className="border-t border-slate-800"
                    >
                      <td className="px-4 py-3 font-semibold">{product.name}</td>
                      <td className="px-4 py-3 text-slate-300">
                        {product.category}
                      </td>
                      <td className="px-4 py-3">{product.costPrice}</td>
                      <td className="px-4 py-3 text-emerald-300">
                        {product.sellingPrice}
                      </td>
                      <td className="px-4 py-3">{product.stock}</td>
                      <td className="px-4 py-3">
                        {product.lowStock ? (
                          <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                            Low stock
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                            In stock
                          </span>
                        )}
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
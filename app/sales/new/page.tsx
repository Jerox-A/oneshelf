import AppNav from "@/components/AppNav";
const products = [
    {
      name: "Rice",
      price: "$12",
      stock: "4 bags left",
    },
    {
      name: "Soap",
      price: "$3",
      stock: "6 bars left",
    },
    {
      name: "Sugar",
      price: "$10",
      stock: "3 packs left",
    },
    {
      name: "Cooking Oil",
      price: "$14",
      stock: "18 bottles left",
    },
  ];
  
  const customers = ["Walk-in customer", "Mary Johnson", "John Mensah", "Amina Yusuf"];
  
  export default function NewSalePage() {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <header className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-emerald-300">OneShelf</p>
              <h1 className="mt-1 text-3xl font-bold">New sale</h1>
              <p className="mt-2 text-sm text-slate-400">
                Record what was sold, how much was paid, and what is still owed.
              </p>
            </div>
  
            <a
              href="/dashboard"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200"
            >
              Back to dashboard
            </a>
            <AppNav />
          </header>
  
          <section className="mt-8 grid gap-6 lg:grid-cols-3">
            <form className="rounded-2xl border border-slate-800 bg-slate-900 p-5 lg:col-span-2">
              <h2 className="text-lg font-semibold">Sale details</h2>
  
              <div className="mt-5 grid gap-5">
                <label className="grid gap-2">
                  <span className="text-sm text-slate-300">Customer</span>
                  <select className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none">
                    {customers.map((customer) => (
                      <option key={customer}>{customer}</option>
                    ))}
                  </select>
                </label>
  
                <label className="grid gap-2">
                  <span className="text-sm text-slate-300">Product</span>
                  <select className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none">
                    {products.map((product) => (
                      <option key={product.name}>{product.name}</option>
                    ))}
                  </select>
                </label>
  
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm text-slate-300">Quantity</span>
                    <input
                      type="number"
                      placeholder="Example: 2"
                      className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
                    />
                  </label>
  
                  <label className="grid gap-2">
                    <span className="text-sm text-slate-300">Total amount</span>
                    <input
                      type="text"
                      placeholder="$24"
                      className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
                    />
                  </label>
                </div>
  
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm text-slate-300">Amount paid</span>
                    <input
                      type="text"
                      placeholder="$20"
                      className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
                    />
                  </label>
  
                  <label className="grid gap-2">
                    <span className="text-sm text-slate-300">Balance owed</span>
                    <input
                      type="text"
                      placeholder="$4"
                      className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
                    />
                  </label>
                </div>
  
                <label className="grid gap-2">
                  <span className="text-sm text-slate-300">Payment method</span>
                  <select className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none">
                    <option>Cash</option>
                    <option>Mobile money</option>
                    <option>Bank transfer</option>
                    <option>Credit / Pay later</option>
                  </select>
                </label>
  
                <label className="grid gap-2">
                  <span className="text-sm text-slate-300">Notes</span>
                  <textarea
                    placeholder="Example: Customer will pay balance on Friday"
                    className="min-h-28 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
                  />
                </label>
  
                <button
                  type="button"
                  className="rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950"
                >
                  Save sale
                </button>
              </div>
            </form>
  
            <aside className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <h2 className="text-lg font-semibold">Quick summary</h2>
  
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between border-b border-slate-800 pb-3">
                    <span className="text-slate-400">Total</span>
                    <span className="font-semibold">$24</span>
                  </div>
  
                  <div className="flex justify-between border-b border-slate-800 pb-3">
                    <span className="text-slate-400">Paid</span>
                    <span className="font-semibold text-emerald-300">$20</span>
                  </div>
  
                  <div className="flex justify-between">
                    <span className="text-slate-400">Balance</span>
                    <span className="font-semibold text-amber-300">$4</span>
                  </div>
                </div>
              </div>
  
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <h2 className="text-lg font-semibold">Available products</h2>
  
                <div className="mt-5 space-y-3">
                  {products.map((product) => (
                    <div
                      key={product.name}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-emerald-300">
                          {product.price}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">
                        {product.stock}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>
    );
  }
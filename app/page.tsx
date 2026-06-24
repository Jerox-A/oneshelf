export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 rounded-full bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
          OneShelf for small retail shops
        </div>

        <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
          Know what&apos;s sold, what&apos;s left, and who owes you.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-300">
          OneShelf helps small shop owners track sales, stock, customers,
          payments, and simple receipts from one phone-friendly app.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a
            href="#waitlist"
            className="rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-slate-950"
          >
            Join the waitlist
          </a>

          <a
            href="#features"
            className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white"
          >
            See features
          </a>
        </div>

        <div
          id="features"
          className="mt-16 grid w-full gap-4 text-left sm:grid-cols-3"
        >
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="font-semibold">Track sales</h2>
            <p className="mt-2 text-sm text-slate-400">
              Record daily sales quickly and see how much cash came in.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="font-semibold">Manage stock</h2>
            <p className="mt-2 text-sm text-slate-400">
              Know what products are left and which items are running low.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="font-semibold">Know who owes you</h2>
            <p className="mt-2 text-sm text-slate-400">
              Track customer balances when people buy now and pay later.
            </p>
          </div>
        </div>

        <form
          id="waitlist"
          className="mt-12 flex w-full max-w-md flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-white px-5 py-3 font-semibold text-slate-950"
          >
            Join
          </button>
        </form>
      </section>
    </main>
  );
}
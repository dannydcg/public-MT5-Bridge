export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="mt-4 text-slate-600">This is the starting point for the Crypto MT5 Bridge dashboard.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {['Exchange Accounts', 'Symbols', 'Risk Settings', 'MT5 Sessions'].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 p-5">
                <h2 className="text-lg font-medium">{item}</h2>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

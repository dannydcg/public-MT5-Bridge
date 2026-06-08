import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-6 py-24">
        <h1 className="text-4xl font-semibold">Crypto MT5 Bridge Dashboard</h1>
        <p className="mt-4 text-lg text-slate-700">
          Manage Binance/Bybit keys, MT5 tokens, and risk settings.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/login" className="rounded-lg bg-slate-900 px-5 py-3 text-white shadow-sm hover:bg-slate-700">
            Login
          </Link>
          <Link href="/register" className="rounded-lg border border-slate-300 px-5 py-3 text-slate-900 hover:bg-slate-100">
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}

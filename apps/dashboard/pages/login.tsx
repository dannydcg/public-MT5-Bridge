import Link from 'next/link';

export default function Login() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-md px-6 py-24">
        <h1 className="text-3xl font-semibold">Login</h1>
        <form className="mt-8 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input type="email" className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input type="password" className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2" />
          </label>
          <button className="w-full rounded-lg bg-slate-900 px-4 py-3 text-white">Sign in</button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Need an account?{' '}
          <Link href="/register" className="text-sky-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}

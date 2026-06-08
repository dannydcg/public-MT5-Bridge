import Link from 'next/link';
import { ReactNode } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/exchange-accounts', label: 'Exchange Accounts' },
  { href: '/symbols', label: 'Symbols' },
  { href: '/risk-settings', label: 'Risk Settings' },
  { href: '/mt5-sessions', label: 'MT5 Sessions' },
  { href: '/orders', label: 'Orders' },
];

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="text-xl font-semibold">Crypto MT5 Bridge</div>
          <nav className="hidden items-center gap-4 md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-slate-600 hover:text-slate-900">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

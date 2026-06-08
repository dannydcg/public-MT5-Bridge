import Layout from '../components/Layout';

export default function SymbolsPage() {
  return (
    <Layout>
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Symbols</h1>
        <p className="mt-4 text-slate-600">Configure MT5 symbol mappings for Binance and Bybit instruments.</p>
      </div>
    </Layout>
  );
}

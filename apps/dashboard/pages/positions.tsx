import Layout from '../components/Layout';

export default function PositionsPage() {
  return (
    <Layout>
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Positions</h1>
        <p className="mt-4 text-slate-600">View open positions and P&L.</p>
      </div>
    </Layout>
  );
}

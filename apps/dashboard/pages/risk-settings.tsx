import Layout from '../components/Layout';

export default function RiskSettingsPage() {
  return (
    <Layout>
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Risk Settings</h1>
        <p className="mt-4 text-slate-600">Configure per-user and per-account risk limits.</p>
      </div>
    </Layout>
  );
}

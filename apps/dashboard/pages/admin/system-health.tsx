import Layout from '../../components/Layout';

export default function AdminSystemHealthPage() {
  return (
    <Layout>
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Admin — System Health</h1>
        <p className="mt-4 text-slate-600">Overview of system metrics and alerts.</p>
      </div>
    </Layout>
  );
}

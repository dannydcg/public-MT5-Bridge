import Layout from '../components/Layout';

export default function Mt5SessionsPage() {
  return (
    <Layout>
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">MT5 Sessions</h1>
        <p className="mt-4 text-slate-600">View active MT5 terminal sessions and connection details.</p>
      </div>
    </Layout>
  );
}

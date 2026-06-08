import Layout from '../components/Layout';

export default function OrdersPage() {
  return (
    <Layout>
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Orders</h1>
        <p className="mt-4 text-slate-600">View and search order history.</p>
      </div>
    </Layout>
  );
}

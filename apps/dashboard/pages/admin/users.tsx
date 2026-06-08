import Layout from '../../components/Layout';

export default function AdminUsersPage() {
  return (
    <Layout>
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Admin — Users</h1>
        <p className="mt-4 text-slate-600">Manage user accounts and roles.</p>
      </div>
    </Layout>
  );
}

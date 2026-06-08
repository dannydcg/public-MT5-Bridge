import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';

export default function DemoPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [execs, setExecs] = useState<any[]>([]);

  const fetchData = async () => {
    const [oRes, eRes] = await Promise.all([
      fetch('/api/demo/orders').then(r=>r.json()),
      fetch('/api/demo/executions').then(r=>r.json())
    ]);
    setOrders(oRes.orders || []);
    setExecs(eRes.executions || []);
  }

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 3000);
    return () => clearInterval(iv);
  }, []);

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Demo Orders & Executions</h1>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold">Orders</h2>
            <table className="w-full text-sm">
              <thead><tr><th>id</th><th>symbol</th><th>side</th><th>qty</th><th>price</th><th>status</th></tr></thead>
              <tbody>
                {orders.map(o=> (
                  <tr key={o.id}><td>{o.mt5_client_order_id}</td><td>{o.mt5_symbol}</td><td>{o.side}</td><td>{o.quantity}</td><td>{o.price}</td><td>{o.status}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h2 className="font-semibold">Executions</h2>
            <table className="w-full text-sm">
              <thead><tr><th>id</th><th>order_id</th><th>qty</th><th>price</th><th>at</th></tr></thead>
              <tbody>
                {execs.map(e=> (
                  <tr key={e.id}><td>{e.exchange_execution_id}</td><td>{e.order_id}</td><td>{e.executed_quantity}</td><td>{e.executed_price}</td><td>{e.executed_at}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}

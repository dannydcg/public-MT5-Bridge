import { query } from '../db.js';

let running = false;

export const startOrderRouter = async () => {
  if (running) return;
  running = true;
  // process loop
  (async () => {
    while (running) {
      try {
        // find accepted demo orders that are not yet executed
        const res = await query("SELECT id, user_id, mt5_client_order_id, mt5_symbol, side, order_type, quantity, price FROM orders WHERE status = 'accepted' AND exchange = 'DEMO' LIMIT 5");
        for (const row of res.rows) {
          // mark processing
          await query('UPDATE orders SET status = $1, updated_at = now() WHERE id = $2', ['processing', row.id]);

          // simulate execution delay
          await new Promise(r => setTimeout(r, 500));

          const execRes = await query(
            `INSERT INTO executions (order_id, exchange_execution_id, executed_quantity, executed_price, executed_at)
             VALUES ($1, $2, $3, $4, now()) RETURNING id`,
            [row.id, `router_exec_${Date.now()}`, row.quantity, row.price ?? 0]
          );

          // update order status
          await query('UPDATE orders SET status = $1, exchange_order_id = $2, updated_at = now() WHERE id = $3', ['filled', execRes.rows[0].id, row.id]);
        }
      } catch (err) {
        // log and continue
        console.error('orderRouter error', err);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  })();
};

export const stopOrderRouter = async () => { running = false; };

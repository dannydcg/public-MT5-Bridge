import pandas as pd
from typing import Optional
from dataclasses import dataclass
from fx_trader.risk import simple_position_size


@dataclass
class Trade:
    entry_time: pd.Timestamp
    exit_time: pd.Timestamp
    entry_price: float
    exit_price: float
    pnl: float


def simple_backtest(df: pd.DataFrame, signals: pd.Series, capital: float = 10000.0, risk_per_trade: float = 0.01, stop_loss_pips: float = 0.001, fee_pct: float = 0.0, slippage_pct: float = 0.0):
    """Loop-based backtest that sizes positions using fixed fractional method and returns equity series and trades DataFrame.

    - `df` must contain columns: open, high, low, close
    - `signals` should be -1/0/1 with the signal to *enter* at next bar open
    """
    df = df.copy().reset_index(drop=False)
    n = len(df)
    equity = capital
    equity_curve = []
    trades = []

    prev_pos = 0
    entry_price = None
    entry_time = None
    units = 0.0

    for i in range(n - 1):
        row = df.iloc[i]
        next_row = df.iloc[i+1]
        # execution at next open
        exec_price = next_row['open']
        signal = signals.reindex(df.index).fillna(0).iloc[i]
        # position held during this bar is prev_pos
        # If entering now (signal != prev_pos), open/close a trade at exec_price
        if signal != prev_pos:
            # Close existing position if any
            if prev_pos != 0 and entry_price is not None:
                exit_price = exec_price
                pnl = prev_pos * units * (exit_price - entry_price)
                trades.append(Trade(entry_time, next_row['datetime'], entry_price, exit_price, pnl))
                equity += pnl
            # Apply fees/slippage as percent of equity
            trade_cost = equity * (fee_pct + slippage_pct)
            equity -= trade_cost
            # Open new position if signal != 0
            if signal != 0:
                entry_price = exec_price
                entry_time = next_row['datetime']
                units = simple_position_size(entry_price, equity, risk_per_trade, stop_loss_pips)
            else:
                # now flat
                entry_price = None
                entry_time = None
                units = 0.0
            prev_pos = signal

        # mark equity for this step
        equity_curve.append(equity)

    # append final equity value
    equity_curve.append(equity)

    equity_series = pd.Series(equity_curve, index=df['datetime'])
    # convert trades to DataFrame
    if trades:
        trades_df = pd.DataFrame([t.__dict__ for t in trades])
    else:
        trades_df = pd.DataFrame(columns=['entry_time','exit_time','entry_price','exit_price','pnl'])

    return equity_series, trades_df

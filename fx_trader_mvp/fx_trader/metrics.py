import pandas as pd
import numpy as np
from math import sqrt


def annualized_return(equity: pd.Series, periods_per_year: float = 252.0) -> float:
    """Compute CAGR-like annualized return from equity series indexed by time-ordered rows."""
    if equity.empty:
        return 0.0
    start = equity.iloc[0]
    end = equity.iloc[-1]
    n_periods = len(equity)
    years = n_periods / periods_per_year if periods_per_year > 0 else 1.0
    if years <= 0:
        return 0.0
    return (end / start) ** (1.0 / years) - 1.0


def max_drawdown(equity: pd.Series) -> float:
    roll_max = equity.cummax()
    drawdown = (equity - roll_max) / roll_max
    return drawdown.min()


def sharpe_ratio(equity: pd.Series, periods_per_year: float = 252.0, risk_free_rate: float = 0.0) -> float:
    returns = equity.pct_change().dropna()
    if returns.empty:
        return 0.0
    rf_per_period = (1 + risk_free_rate) ** (1.0 / periods_per_year) - 1.0
    excess = returns - rf_per_period
    mean = excess.mean()
    std = excess.std()
    if std == 0:
        return 0.0
    return (mean / std) * sqrt(periods_per_year)


def trade_stats(trades: pd.DataFrame) -> dict:
    # trades expected columns: entry_time, exit_time, pnl
    if trades.empty:
        return {"trades":0, "win_rate":0.0, "avg_win":0.0, "avg_loss":0.0}
    wins = trades[trades['pnl'] > 0]
    losses = trades[trades['pnl'] <= 0]
    win_rate = len(wins) / len(trades) if len(trades) > 0 else 0.0
    avg_win = wins['pnl'].mean() if not wins.empty else 0.0
    avg_loss = losses['pnl'].mean() if not losses.empty else 0.0
    return {"trades": len(trades), "win_rate": win_rate, "avg_win": avg_win, "avg_loss": avg_loss}


def summary(equity: pd.Series, trades: pd.DataFrame = None, periods_per_year: float = 252.0) -> dict:
    return {
        "CAGR": annualized_return(equity, periods_per_year),
        "Sharpe": sharpe_ratio(equity, periods_per_year),
        "Max Drawdown": max_drawdown(equity),
        **(trade_stats(trades) if trades is not None else {})
    }

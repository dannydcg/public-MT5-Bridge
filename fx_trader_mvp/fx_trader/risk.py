from typing import Callable
import pandas as pd


def fixed_fractional(equity: float, risk_per_trade: float) -> float:
    """Return position value in account currency based on fixed fractional risk of equity."""
    return equity * risk_per_trade


def simple_position_size(open_price: float, equity: float, risk_per_trade: float, stop_loss_pips: float) -> float:
    """Return number of units to buy/sell given stop-loss in pips (price units). Avoid division by zero."""
    if stop_loss_pips <= 0 or open_price <= 0:
        return 0.0
    position_value = fixed_fractional(equity, risk_per_trade)
    # units = position_value / (stop_loss_pips) in price units; assume pip is price unit for simplicity
    units = position_value / (stop_loss_pips * open_price)
    return units

# A hook type: function that given row and equity returns units
PositionSizer = Callable[[pd.Series, float], float]

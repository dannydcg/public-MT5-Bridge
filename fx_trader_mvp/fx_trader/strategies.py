import pandas as pd


def sma_crossover(df: pd.DataFrame, short: int = 10, long: int = 50) -> pd.Series:
    """Return signals: 1 for long, -1 for short, 0 for flat. Based on SMA crossover."""
    short_sma = df['close'].rolling(short).mean()
    long_sma = df['close'].rolling(long).mean()
    signal = (short_sma > long_sma).astype(int) - (short_sma < long_sma).astype(int)
    # Convert to -1/0/1
    return signal.fillna(0).astype(int)


def rsi_mean_reversion(df: pd.DataFrame, length: int = 14, lower: int = 30, upper: int = 70) -> pd.Series:
    # simple RSI using returns
    delta = df['close'].diff()
    up = delta.clip(lower=0).rolling(length).mean()
    down = -delta.clip(upper=0).rolling(length).mean()
    rs = up / down.replace(0, 1e-6)
    rsi = 100 - (100 / (1 + rs))
    signal = pd.Series(0, index=df.index)
    signal[rsi < lower] = 1
    signal[rsi > upper] = -1
    return signal

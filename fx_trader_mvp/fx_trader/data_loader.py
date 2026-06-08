import pandas as pd
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def load_csv(pair: str, timeframe: str = "H1") -> pd.DataFrame:
    """Load a CSV OHLCV file for a pair and return a DataFrame with a datetime index.
    Expected CSV columns: datetime, open, high, low, close, volume (volume optional)
    """
    fname = DATA_DIR / f"{pair}_{timeframe}.csv"
    if not fname.exists():
        raise FileNotFoundError(f"Data file not found: {fname}")
    df = pd.read_csv(fname, parse_dates=["datetime"])  
    df = df.set_index("datetime").sort_index()
    return df

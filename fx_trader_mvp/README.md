# FX Trader MVP

This is a minimal MVP for research, backtesting and paper-trading Forex strategies.

Quick start (PowerShell):

1. Create a Python virtual environment and activate it

```powershell
cd C:\Users\Dell\Desktop\html\fx_trader_mvp
python -m venv .venv
.venv\Scripts\Activate.ps1
```

2. Install dependencies

```powershell
pip install -r requirements.txt
```

3. Run the Streamlit dashboard

```powershell
streamlit run app.py
```

Files:
- `fx_trader/` - core modules (data loader, strategies, backtest)
- `app.py` - Streamlit UI to run backtests and view results

Notes:
- This is a research MVP. Live trading requires adding a broker connector and safety approvals.
- Default data loader expects CSV files placed in `data/` (sample loader included).
import streamlit as st
import pandas as pd
from fx_trader.data_loader import load_csv
from fx_trader.strategies import sma_crossover, rsi_mean_reversion
from fx_trader.backtest import simple_backtest
from fx_trader.metrics import summary

st.title("FX Trader MVP")

pair = st.sidebar.text_input("Currency pair (e.g. EURUSD)", value="EURUSD")
timeframe = st.sidebar.selectbox("Timeframe", ["H1", "D1"], index=0)

if st.sidebar.button("Load & Backtest"):
    try:
        df = load_csv(pair, timeframe)
        st.write(df.tail())

        st.sidebar.header("Strategy")
        strat = st.sidebar.selectbox("Strategy", ["SMA", "RSI"])

        if strat == "SMA":
            short = st.sidebar.number_input("Short SMA", value=10)
            long = st.sidebar.number_input("Long SMA", value=50)
            signals = sma_crossover(df, short=short, long=long)
        else:
            length = st.sidebar.number_input("RSI length", value=14)
            lower = st.sidebar.number_input("RSI lower", value=30)
            upper = st.sidebar.number_input("RSI upper", value=70)
            signals = rsi_mean_reversion(df, length=length, lower=lower, upper=upper)

    equity_series, trades_df = simple_backtest(df, signals)
    st.subheader("Equity curve")
    st.line_chart(equity_series)

    st.subheader("Metrics")
    metrics = summary(equity_series)
    st.json(metrics)

    st.subheader("Trades")
    st.write(trades_df)
    except Exception as e:
        st.error(str(e))

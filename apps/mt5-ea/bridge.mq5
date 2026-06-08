//+------------------------------------------------------------------+
//| Crypto MT5 Bridge Expert Advisor                               |
//+------------------------------------------------------------------+
#property copyright "Crypto MT5 Bridge"
#property version   "0.1"

input string BridgeServerUrl = "wss://bridge.example.com/mt5";
input string TerminalToken = "mt5_live_xxxxxxxxxxxxx";
input string SubscribeSymbols = "BTCUSDT,ETHUSDT";
input int PollIntervalSec = 1; // polling interval when WebSocket isn't available
input bool UseTestnet = true;
input double SignalPct = 0.5; // percent move to trigger demo signal
input int PanelFontSize = 12;
input int PanelX = 10;
input int PanelY = 10;
input bool PlaceDemoOrders = true;
input double DemoOrderQty = 0.001;

// Bridge symbol state
string bridgeSymbols[];
double bridgeBid[];
double bridgeAsk[];
double bridgeLast[];
datetime bridgeTime[];

int FindSymbolIndex(const string sym)
{
  for (int i = 0; i < ArraySize(bridgeSymbols); ++i)
  {
    if (bridgeSymbols[i] == sym) return i;
  }
  return -1;
}

void RegisterSymbol(const string sym)
{
  if (FindSymbolIndex(sym) != -1) return;
  int n = ArraySize(bridgeSymbols);
  ArrayResize(bridgeSymbols, n+1);
  bridgeSymbols[n] = sym;
  ArrayResize(bridgeBid, n+1); bridgeBid[n] = 0.0;
  ArrayResize(bridgeAsk, n+1); bridgeAsk[n] = 0.0;
  ArrayResize(bridgeLast, n+1); bridgeLast[n] = 0.0;
  ArrayResize(bridgeTime, n+1); bridgeTime[n] = 0;
  PrintFormat("Bridge: registered symbol %s", sym);
}

double UpdateTickState(const string sym, const double bid, const double ask, const double last)
{
  int idx = FindSymbolIndex(sym);
  if (idx == -1)
  {
    RegisterSymbol(sym);
    idx = FindSymbolIndex(sym);
    if (idx == -1) return 0.0; // failed
  }
  double prev = bridgeLast[idx];
  bridgeBid[idx] = bid;
  bridgeAsk[idx] = ask;
  bridgeLast[idx] = last;
  bridgeTime[idx] = TimeCurrent();
  return prev;
}

double GetBridgeLastPrice(const string sym)
{
  int idx = FindSymbolIndex(sym);
  if (idx == -1) return 0.0;
  return bridgeLast[idx];
}

// Hook for strategy logic when a new bridge tick arrives
void HandleBridgeTick(const string sym, const double prevLast, const double bid, const double ask, const double last)
{
  // Example: print and simple threshold notification (placeholder)
  PrintFormat("[BRIDGE] %s bid=%.5f ask=%.5f last=%.5f", sym, bid, ask, last);
  // signal when price moves more than SignalPct from previous
  if (prevLast > 0)
  {
    double change = MathAbs((last - prevLast) / prevLast) * 100.0;
    if (change >= SignalPct)
    {
      PrintFormat("[BRIDGE SIGNAL] %s moved %.3f%% (%.5f -> %.5f)", sym, change, prevLast, last);
      // visual cue: create/update alert label
      string aname = "bridge_alert_" + sym;
      string atxt = StringFormat("SIGNAL %s %.3f%%", sym, change);
      if (!ObjectExists(aname))
      {
        ObjectCreate(0, aname, OBJ_LABEL, 0, 0, 0);
        ObjectSetInteger(0, aname, OBJPROP_CORNER, CORNER_RIGHT_UPPER);
      }
      ObjectSetText(aname, atxt, PanelFontSize, "Arial", clrYellow);
      ObjectSetInteger(0, aname, OBJPROP_XDISTANCE, PanelX);
      ObjectSetInteger(0, aname, OBJPROP_YDISTANCE, PanelY);
      // attempt to place a demo order when a signal occurs
      if (PlaceDemoOrders)
      {
        string side = last > prevLast ? "BUY" : "SELL";
        string host = BridgeServerUrl;
        if (StringFind(host, "wss://") == 0) host = StringReplace(host, "wss://", "https://");
        else if (StringFind(host, "ws://") == 0) host = StringReplace(host, "ws://", "http://");
        if (StringFind(host, "/mt5") == -1)
        {
          if (StringFind(host, "/") == StringLen(host)-1) host += "mt5";
          else host += "/mt5";
        }
        string url = host + "/api/mt5/place_order?token=" + TerminalToken + "&symbol=" + sym + "&side=" + side + "&orderType=MARKET&quantity=" + DoubleToString(DemoOrderQty, 6) + "&demo=true";
        uchar result[];
        string resp_hdrs = "";
        int res = WebRequest("GET", url, "", 10000, result, resp_hdrs);
        if (res == -1)
        {
          PrintFormat("Order WebRequest failed. GetLastError=%d", GetLastError());
        }
        else
        {
          string body = CharArrayToString(result);
          PrintFormat("Order response: %s", body);
        }
      }
    }
  }
  // update chart panel values
  RefreshChartPanel();
}

void RefreshChartPanel()
{
  int n = ArraySize(bridgeSymbols);
  for (int i = 0; i < n; ++i)
  {
    string sym = bridgeSymbols[i];
    string name = "bridge_label_" + sym;
    string text = StringFormat("%s  L:%.5f B:%.5f A:%.5f", sym, bridgeLast[i], bridgeBid[i], bridgeAsk[i]);
    if (!ObjectExists(name))
    {
      ObjectCreate(0, name, OBJ_LABEL, 0, 0, 0);
      ObjectSetInteger(0, name, OBJPROP_CORNER, CORNER_LEFT_UPPER);
    }
    ObjectSetText(name, text, PanelFontSize, "Arial", clrWhite);
    ObjectSetInteger(0, name, OBJPROP_XDISTANCE, PanelX);
    ObjectSetInteger(0, name, OBJPROP_YDISTANCE, PanelY + i*(PanelFontSize+6));
  }
}

int OnInit() {
  Print("MT5 Bridge EA initialized");

  // Start polling loop (MT5 doesn't support raw WebSocket in MQL5 WebRequest)
  EventSetTimer(MathMax(1, PollIntervalSec));

  return INIT_SUCCEEDED;
}

// OnDeinit defined at bottom to clean up timer

void OnTick() {
}

void OnTimer()
{
  static datetime lastRequest = 0;
  datetime now = TimeCurrent();
  if ((int)(now - lastRequest) < PollIntervalSec) return;
  lastRequest = now;

  string url = BridgeServerUrl;
  // convert ws:// or wss:// to http(s) for polling
  if (StringFind(url, "wss://") == 0)
    url = StringReplace(url, "wss://", "https://");
  else if (StringFind(url, "ws://") == 0)
    url = StringReplace(url, "ws://", "http://");

  // ensure polling endpoint
  if (StringFind(url, "/mt5") == -1)
  {
    if (StringFind(url, "/") == StringLen(url)-1)
      url += "mt5/poll";
    else
      url += "/mt5/poll";
  }

  string symbolsEscaped = StringReplace(SubscribeSymbols, " ", "");
  string fullUrl = url + "?token=" + TerminalToken + "&symbols=" + symbolsEscaped;

  uchar result[];
  string response_headers = "";
  int res = WebRequest("GET", fullUrl, "", 5000, result, response_headers);
  if (res == -1)
  {
    PrintFormat("WebRequest error. GetLastError=%d", GetLastError());
    return;
  }

  string body = CharArrayToString(result);
  if (StringLen(body) == 0)
  {
    // no data
    return;
  }

  // basic parsing: server may send multiple JSON messages separated by newlines
  int start = 0;
  while (start < StringLen(body))
  {
    int nl = StringFind(body, "\n", start);
    string line;
    if (nl == -1)
    {
      line = StringSubstr(body, start);
      start = StringLen(body);
    }
    else
    {
      line = StringSubstr(body, start, nl - start);
      start = nl + 1;
    }

    if (StringLen(line) == 0) continue;

    // try to extract type and payload.symbol/bid/ask
    string ttype = ExtractJsonString(line, "type");
    string payload = ExtractJsonObject(line, "payload");
    if (ttype == "tick")
    {
      string sym = ExtractJsonString(payload, "symbol");
      string bid = ExtractJsonString(payload, "bid");
      string ask = ExtractJsonString(payload, "ask");
      string last = ExtractJsonString(payload, "last");
      double bidD = StringToDouble(bid);
      double askD = StringToDouble(ask);
      double lastD = StringToDouble(last);
      double prev = UpdateTickState(sym, bidD, askD, lastD);
      HandleBridgeTick(sym, prev, bidD, askD, lastD);
    }
    else if (ttype == "symbol_metadata")
    {
      string sym = ExtractJsonString(payload, "symbol");
      RegisterSymbol(sym);
      PrintFormat("METADATA %s registered", sym);
    }
    else if (ttype == "error")
    {
      string msg = ExtractJsonString(line, "message");
      PrintFormat("BRIDGE ERROR: %s", msg);
    }
  }
}

// Very small helpers to extract simple JSON string values (not a full JSON parser)
string ExtractJsonString(const string json, const string key)
{
  int p = StringFind(json, "\"" + key + "\"");
  if (p == -1) return "";
  int colon = StringFind(json, ":", p);
  if (colon == -1) return "";
  int firstQuote = StringFind(json, "\"", colon);
  if (firstQuote == -1) return "";
  int secondQuote = StringFind(json, "\"", firstQuote+1);
  if (secondQuote == -1) return StringSubstr(json, firstQuote+1);
  return StringSubstr(json, firstQuote+1, secondQuote - firstQuote - 1);
}

string ExtractJsonObject(const string json, const string key)
{
  int p = StringFind(json, "\"" + key + "\"");
  if (p == -1) return "";
  int start = StringFind(json, "{", p);
  if (start == -1) return "";
  int depth = 0;
  for (int i = start; i < StringLen(json); ++i)
  {
    int c = StringGetCharacter(json, i);
    if (c == '{') depth++;
    else if (c == '}') depth--;
    if (depth == 0)
    {
      return StringSubstr(json, start, i - start + 1);
    }
  }
  return "";
}

void OnDeinit(const int reason)
{
  EventKillTimer();
}

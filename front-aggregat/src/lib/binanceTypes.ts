export type Binance24hrTicker = {
e: string; // Event type
E: number; // Event time (ms epoch)
s: string; // Symbol
p: string; // Price change (Δ)
P: string; // Price change (%)
w: string; // Weighted average price (24h)
c: string; // Last price
Q: string; // Last quantity
o: string; // Open price (24h)
h: string; // High price (24h)
l: string; // Low price (24h)
v: string; // Total traded base asset volume (24h)
q: string; // Total traded quote asset volume (24h)
O: number; // Statistics open time
C: number; // Statistics close time
F: number; // First trade ID
L: number; // Last trade ID
n: number; // Total number of trades (24h)
};


export type TickerNumeric = {
eventType: string; // Event type (display long label)
eventTime: number; // ms epoch
symbol: string; // Symbol
priceChange: number; // Δ
priceChangePercent: number;// %
weightedAvgPrice: number; // 24h
lastPrice: number; // last
lastQty: number; // Q
openPrice: number; // 24h
highPrice: number; // 24h
lowPrice: number; // 24h
baseVolume24h: number; // v
quoteVolume24h: number; // q
statsOpenTime: number; // O
statsCloseTime: number; // C
firstTradeId: number; // F
lastTradeId: number; // L
tradeCount24h: number; // n
lastSeenAt: number; // client receive time (ms epoch)
};
import React, { useEffect, useState } from 'react';

const BitcoinTicker: React.FC = () => {
  const [price, setPrice] = useState<string>('...');

  useEffect(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const newPrice = parseFloat(data.c).toFixed(2); // "c" = last price
      setPrice(newPrice);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close(); // Nettoyage à la fermeture du composant
    };
  }, []);

  return (
    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
      💰 Bitcoin (BTC/USDT) : ${price}
    </div>
  );
};

export default BitcoinTicker;

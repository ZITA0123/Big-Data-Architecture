import React from "react";

const CryptoSelector = ({ cryptos, onSelect }) => {
  return (
    <div>
      <h2>Sélectionnez une Crypto</h2>
      <select onChange={(e) => onSelect(e.target.value)}>
        <option value="">-- Choisissez une crypto --</option>
        {cryptos.map((crypto, index) => (
          <option key={index} value={crypto}>
            {crypto}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CryptoSelector;
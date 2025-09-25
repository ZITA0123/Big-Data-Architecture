import React from "react";

const CryptoTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>Aucune donnée disponible.</p>;
  }

  return (
    <div>
      <h2>Données des Crypto-Monnaies</h2>
      <table>
        <thead>
          <tr>
            <th>Crypto</th>
            <th>Prix le plus bas</th>
            <th>Prix le plus haut</th>
            <th>Volume</th>
            <th>Nombre de trades</th>
            <th>Variation du prix</th>
          </tr>
        </thead>
        <tbody>
          {data.map((crypto, index) => (
            <tr key={index}>
              <td>{crypto.name}</td>
              <td>{crypto.lowPrice}</td>
              <td>{crypto.highPrice}</td>
              <td>{crypto.volume}</td>
              <td>{crypto.trades}</td>
              <td>{crypto.variation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CryptoTable;
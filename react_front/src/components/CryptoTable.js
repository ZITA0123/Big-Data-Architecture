import React, { useState } from "react";
import { FaClock, FaDollarSign, FaChartLine, FaSortNumericDown, FaChartBar, FaExchangeAlt } from "react-icons/fa"; // Importer des icônes

const CryptoTable = ({ data, minPrice, maxPrice }) => {
  const [currentPage, setCurrentPage] = useState(1); // Page actuelle
  const rowsPerPage = 10; // Nombre de lignes par page

  if (!data || data.length === 0) {
    return <p>Aucune donnée disponible.</p>;
  }

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(data.length / rowsPerPage);

  // Obtenir les données pour la page actuelle
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = data.slice(startIndex, startIndex + rowsPerPage);

  // Fonction pour changer de page
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
      <h2>Données des Crypto-Monnaies</h2>
      <p>
        <strong>Prix minimum :</strong> {minPrice || "N/A"} <br />
        <strong>Prix maximum :</strong> {maxPrice || "N/A"}
      </p>
      <table className="crypto-table">
        <thead>
          <tr>
            <th>
              <FaClock /> Heure d'ouverture
            </th>
            <th>
              <FaDollarSign /> Prix d'ouverture
            </th>
            <th>
              <FaDollarSign /> Prix de clôture
            </th>
            <th>
              <FaSortNumericDown /> Prix le plus bas
            </th>
            <th>
              <FaChartLine /> Prix le plus haut
            </th>
            <th>
              <FaChartBar /> Volume
            </th>
            <th>
              <FaExchangeAlt /> Nombre de trades
            </th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((kline, index) => (
            <tr key={index}>
              <td>{new Date(kline.open_time).toLocaleString()}</td>
              <td>{kline.open_price}</td>
              <td>{kline.close_price}</td>
              <td>{kline.low_price}</td>
              <td>{kline.high_price}</td>
              <td>{kline.volume}</td>
              <td>{kline.num_trades}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
          Précédent
        </button>
        <span>
          Page {currentPage} sur {totalPages}
        </span>
        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
          Suivant
        </button>
      </div>
    </div>
  );
};

export default CryptoTable;
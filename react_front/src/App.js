import React, { useEffect, useState } from "react";
import CryptoTable from "./components/CryptoTable";
import CryptoChart from "./components/CryptoChart";
import AlertBox from "./components/AlertBox";
import { FaSearch } from "react-icons/fa";
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState(""); // Terme de recherche
  const [searchResults, setSearchResults] = useState([]); // Résultats de recherche
  const [selectedCrypto, setSelectedCrypto] = useState(""); // Crypto sélectionnée
  const [cryptoData, setCryptoData] = useState([]); // Données de la crypto sélectionnée
  const [alertMessage, setAlertMessage] = useState(""); // Message d'alerte
  const [minPrice, setMinPrice] = useState(null); // Prix minimum
  const [maxPrice, setMaxPrice] = useState(null); // Prix maximum

  // Fonction pour interroger l'API Binance pour les paires de crypto
  const fetchSearchResults = async (query) => {
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/exchangeInfo`
      );
      const data = await response.json();
      const symbols = data.symbols.map((symbol) => symbol.symbol);
      const filtered = symbols.filter((symbol) =>
        symbol.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error("Erreur lors de la récupération des paires :", error);
    }
  };

  // Fonction pour récupérer les données d'une crypto spécifique depuis l'API Flask
  const fetchCryptoData = async (crypto) => {
    try {
      const response = await fetch(
        `http://localhost:5000/klines?symbol=${crypto}&interval=1h`
      );
      const data = await response.json();

      if (data.error) {
        setAlertMessage(data.error);
        setCryptoData([]);
        setMinPrice(null);
        setMaxPrice(null);
      } else {
        setCryptoData(data.data);
        setMinPrice(Math.min(...data.data.map((kline) => kline.low_price)));
        setMaxPrice(Math.max(...data.data.map((kline) => kline.high_price)));
        setAlertMessage(`Les données pour ${crypto} sont prêtes !`);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
      setAlertMessage("Erreur lors de la récupération des données.");
    }
  };

  // Mettre à jour les résultats de recherche en fonction de la saisie
  useEffect(() => {
    if (searchTerm) {
      fetchSearchResults(searchTerm);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  // Charger les données de la crypto sélectionnée
  useEffect(() => {
    if (selectedCrypto) {
      fetchCryptoData(selectedCrypto);
    }
  }, [selectedCrypto]);

  return (
    <div className="App">
      <h1 className="app-title">📊 Crypto Dashboard</h1>

      {/* Barre de recherche */}
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Rechercher une paire de crypto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Résultats de recherche */}
      {searchResults.length > 0 && (
        <ul className="search-results">
          {searchResults.map((result) => (
            <li
              key={result}
              onClick={() => {
                setSelectedCrypto(result);
                setSearchTerm(""); // Réinitialiser la barre de recherche
                setSearchResults([]); // Réinitialiser les résultats
              }}
            >
              {result}
            </li>
          ))}
        </ul>
      )}


      {/* Affichage des alertes */}
      {alertMessage && <AlertBox message={alertMessage} />}


      {/* Graphique des données */}
      <CryptoChart data={cryptoData} />


      {/* Tableau des données */}
      <CryptoTable data={cryptoData} minPrice={minPrice} maxPrice={maxPrice} />

      
    </div>
  );
}

export default App;
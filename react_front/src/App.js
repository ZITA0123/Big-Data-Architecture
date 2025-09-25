import React, { useEffect, useState } from "react";
import CryptoSelector from "./components/CryptoSelector";
import CryptoTable from "./components/CryptoTable";
import AlertBox from "./components/AlertBox";
import './App.css';

function App() {
  const [cryptos] = useState(["Bitcoin", "Ethereum", "BinanceCoin", "Cardano"]); // Liste des cryptos
  const [selectedCrypto, setSelectedCrypto] = useState(""); // Crypto sélectionnée
  const [cryptoData, setCryptoData] = useState([]); // Données de la crypto sélectionnée
  const [alertMessage, setAlertMessage] = useState(""); // Message d'alerte

  // Fonction pour récupérer les données d'une crypto spécifique depuis l'API Flask
  const fetchCryptoData = async (crypto) => {
    try {
      const response = await fetch(`http://localhost:5000/api/crypto/${crypto}`);
      const data = await response.json();
      setCryptoData([data]); // On met les données dans un tableau pour le tableau d'affichage
      setAlertMessage(`Les données pour ${crypto} sont prêtes !`);
    } catch (error) {
      console.error("Erreur lors de la récupération des données :", error);
      setAlertMessage("Erreur lors de la récupération des données.");
    }
  };

  // Charger les données de la crypto sélectionnée
  useEffect(() => {
    if (selectedCrypto) {
      fetchCryptoData(selectedCrypto);
    }
  }, [selectedCrypto]);

  return (
    <div className="App">
      <h1 style={{ textAlign: "center", margin: "20px 0", fontFamily: "Arial" }}>
        📊 Crypto Dashboard
      </h1>

      {/* Affichage des alertes */}
      {alertMessage && <AlertBox message={alertMessage} />}

      {/* Sélection de la crypto */}
      <CryptoSelector cryptos={cryptos} onSelect={setSelectedCrypto} />

      {/* Tableau des données */}
      <CryptoTable data={cryptoData} />
    </div>
  );
}

export default App;
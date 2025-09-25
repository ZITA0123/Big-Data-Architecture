import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";

import AlertBox from "./components/AlertBox";
import TypeStats from "./components/TypeStats";
import Top5List from "./components/Top5List";
import ObjectList from "./components/ObjectList";
import AlertListPage from "./components/AlertListPage"; 
import GroupedTypesPage from "./components/GroupedTypesPage";
import CryptoSelector from "./components/CryptoSelector";
import CryptoTable from "./components/CryptoTable";
import './App.css';


function App() {
  const [alerts, setAlerts] = useState([]);
  const [cryptos] = useState(["Bitcoin", "Ethereum", "BinanceCoin", "Cardano"]); // Liste des cryptos
  const [selectedCrypto, setSelectedCrypto] = useState("");
  const [cryptoData, setCryptoData] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/alerts").then((res) => setAlerts(res.data));
  }, []);

  // Fonction pour récupérer les données depuis l'API Flask
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

  // Gestion de la sélection d'une crypto
  useEffect(() => {
    if (selectedCrypto) {
      fetchCryptoData(selectedCrypto);
    }
  }, [selectedCrypto]);

  return (
    <Router>
      <div className="App">

        <h1 style={{ textAlign: "center", margin: "20px 0", fontFamily: "Arial" }}>
          🌌 Observation d'objets célestes
        </h1>
        <AlertBox alerts={alerts} />

        <Routes>
          <Route
            path="/"
            element={
              <>
                <div className="stats-row">
                  <div className="box"><Top5List /></div>
                  <div className="box"><TypeStats /></div>
                </div>
                <div className="list-section"><ObjectList /></div>
              </>
            }
          />
          <Route path="/alertes" element={<AlertListPage alerts={alerts} />} />
          <Route path="/types" element={<GroupedTypesPage />} />
        </Routes>
        <CryptoSelector cryptos={cryptos} onSelect={setSelectedCrypto} />
        <CryptoTable data={cryptoData} />
      </div>
    </Router>
  );
}

export default App;

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";

import AlertBox from "./components/AlertBox";
import TypeStats from "./components/TypeStats";
import Top5List from "./components/Top5List";
import ObjectList from "./components/ObjectList";
import AlertListPage from "./components/AlertListPage"; 
import GroupedTypesPage from "./components/GroupedTypesPage";
import './App.css';


function App() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/alerts").then((res) => setAlerts(res.data));
  }, []);

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
      </div>
    </Router>
  );
}

export default App;

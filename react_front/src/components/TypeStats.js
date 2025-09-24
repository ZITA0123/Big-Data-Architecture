import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  

function TypeStats() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();  

  useEffect(() => {
    axios.get('http://localhost:5000/objects/count')
      .then(res => {
        if (Array.isArray(res.data)) setData(res.data);
        else setData([]);
      })
      .catch(() => setData([]));
  }, []);

  return (
    <div>
      <h2 style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Agrégation d'objets par type
        <button onClick={() => navigate("/types")} style={{ padding: "4px 8px", fontSize: "14px" }}>
          Voir détails
        </button>
      </h2>

      <table border="1" cellPadding="6" cellSpacing="0" width="100%">
        <thead>
          <tr>
            <th>Type</th>
            <th>Nombre</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.map((item, i) => (
            <tr key={i}>
              <td>{item.type}</td>
              <td>{item.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TypeStats;

import React, { useEffect, useState } from 'react';
import axios from 'axios';

function GroupedTypes() {
  const [groupedData, setGroupedData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/objects/type")
      .then(res => {
        if (res.data && typeof res.data === 'object') {
          setGroupedData(res.data);
        } else {
          setGroupedData({});
        }
      })
      .catch(() => setGroupedData({}))
      .finally(() => setIsLoading(false));
  }, []);

  const typeKeys = Object.keys(groupedData);

  return (
    <div style={{ padding: "20px" }}>
      {isLoading ? (
        <p style={{ textAlign: "center" }}>Chargement...</p>
      ) : typeKeys.length === 0 ? (
        <p style={{ textAlign: "center" }}>
          Aucun objet détecté ou regroupement indisponible pour le moment.
        </p>
      ) : (
        typeKeys.map(type => (
          <div key={type} style={{ marginBottom: "40px" }}>
            <h3 style={{ textTransform: "capitalize", color: "#333" }}>{type}</h3>
            <table border="1" cellPadding="6" width="100%">
              <thead>
                <tr>
                  <th>Vitesse</th>
                  <th>Taille</th>
                  <th>Date</th>
                  <th>Position</th>
                </tr>
              </thead>
              <tbody>
                {groupedData[type].map((obj, i) => (
                  <tr key={i}>
                    <td>{obj.vitesse}</td>
                    <td>{obj.taille}</td>
                    <td>{new Date(obj.datetime).toLocaleString()}</td>
                    <td>
                      {obj.position
                        ? `${obj.position.x.toFixed(2)}, ${obj.position.y.toFixed(2)}, ${obj.position.z.toFixed(2)}`
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}

export default GroupedTypes;

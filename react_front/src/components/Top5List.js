import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Top5List() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/objects/top5')
      .then(res => {
        if (Array.isArray(res.data)) {
          setData(res.data);
        } else {
          setData([]);
        }
      }).catch(() => setData([]));
  }, []);

  return (
    <div>
      <h2> Top 5 objets les plus rapides sur les 24 dernières minutes </h2>
      <table border="1" cellPadding="6" width="100%">
        <thead>
          <tr>
            <th>type</th>
            <th>Vitesse</th>
            <th>Taille</th>
            <th>Date</th>
            <th>Position (x,y,z)</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(data) && data.map((obj, i) => (
            <tr key={i}>
              <td>{obj.type}</td>
              <td>{obj.vitesse}</td>
              <td>{obj.taille}</td>
              <td>{new Date(obj.datetime).toLocaleString()}</td>
              <td>{`${obj.position?.x}, ${obj.position?.y}, ${obj.position?.z}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Top5List;

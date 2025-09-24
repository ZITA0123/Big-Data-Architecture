import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ObjectList() {
  const [objects, setObjects] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 100;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    axios.get(`http://localhost:5000/objects?page=${page}&limit=${limit}`)
      .then(res => {
        const data = res.data;
        if (data && Array.isArray(data.data)) {
          setObjects(data.data);
          setTotalPages(data.pages || 1);
        } else {
          setObjects([]);
        }
      })
      .catch(() => {
        setObjects([]);
        setTotalPages(1);
      });
  }, [page]);

  const handlePrev = () => setPage(prev => Math.max(prev - 1, 1));
  const handleNext = () => setPage(prev => Math.min(prev + 1, totalPages));

  return (
    <div>
      <h2> Liste des objets détectés (page {page})</h2>
      <table border="1" cellPadding="6" width="100%">
        <thead>
          <tr>
            <th>Type</th>
            <th>Vitesse</th>
            <th>Taille</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(objects) && objects.map((o, i) => (
            <tr key={i}>
              <td>{o.type}</td>
              <td>{o.vitesse}</td>
              <td>{o.taille}</td>
              <td>{new Date(o.datetime).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 10, textAlign: 'center' }}>
        <button onClick={handlePrev} disabled={page === 1}>⬅ Précédent</button>
        <span style={{ margin: '0 10px' }}>Page {page} / {totalPages}</span>
        <button onClick={handleNext} disabled={page === totalPages}>Suivant ➡</button>
      </div>
    </div>
  );
}

export default ObjectList;

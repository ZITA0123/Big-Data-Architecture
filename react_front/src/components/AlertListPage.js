import React from 'react';

function AlertListPage({ alerts }) {
  return (
    <div>
      <h2> Liste des objets dangereux</h2>
      {!alerts || alerts.length === 0 ? (
        <p>Aucune alerte détectée.</p>
      ) : (
        <table border="1" cellPadding="6" width="100%">
          <thead>
            <tr>
              <th>Type</th>
              <th>Vitesse</th>
              <th>Taille</th>
              <th>Date</th>
              <th>Position (x,y,z)</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((a, i) => (
              <tr key={i}>
                <td>{a.type}</td>
                <td>{a.vitesse}</td>
                <td>{a.taille}</td>
                <td>{new Date(a.datetime).toLocaleString()}</td>
                <td>{`${a.position?.x}, ${a.position?.y}, ${a.position?.z}`}</td>

              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AlertListPage;

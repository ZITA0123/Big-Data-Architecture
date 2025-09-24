import React from "react";
import { useNavigate } from "react-router-dom";

const AlertBox = React.memo(function AlertBox({ alerts }) {
  const navigate = useNavigate();

  if (!alerts || !alerts.length) return null;

  return (
    <div
      onClick={() => navigate("/alertes")}
      style={{
        backgroundColor: "#ffe6e6",
        color: "red",
        padding: "15px",
        marginBottom: "20px",
        border: "1px solid red",
        borderRadius: "6px",
        textAlign: "center",
        cursor: "pointer"
      }}
    >
      ⚠️ {alerts.length} objet(s) dangereux détecté(s) — cliquez pour voir
    </div>
  );
});

export default AlertBox;

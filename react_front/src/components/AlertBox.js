import React from "react";
import PropTypes from "prop-types";
import "./AlertBox.css";

const AlertBox = ({ message, type = "info" }) => {
  // Définir les classes CSS en fonction du type d'alerte
  const alertClass = `alert-box alert-${type}`;

  return (
    <div className={alertClass}>
      <p>{message}</p>
    </div>
  );
};

// Définir les types de propriétés attendues
AlertBox.propTypes = {
  message: PropTypes.string.isRequired, // Le message est obligatoire
  type: PropTypes.oneOf(["info", "success", "warning", "error"]), // Type d'alerte
};

// Exporter le composant
export default AlertBox;
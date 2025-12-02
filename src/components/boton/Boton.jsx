import React from "react";
import "./Boton.css";

function Boton({ children, onClick }) {
  
  return (
    <button className="boton" onClick={onClick}>
      {children}
    </button>
  );
}

export default Boton;

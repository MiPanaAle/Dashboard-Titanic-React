import React from "react";
import iceberg from "../../img/iceberg.png";
import "./Iceberg.css";

function Iceberg({ containerRef }) {
  return (
    <div className='contenedorIceberg' ref={containerRef}>
      <img 
        src={iceberg}
        className="iceberg" 
        alt="iceberg"
      />
    </div>
  )
}

export default Iceberg;

import React from 'react';
import iceberg from '../../img/iceberg.png'
import './Iceberg.css';

function Iceberg() {
  return (
    <div className='contenedorIceberg'>
      <img 
        src={iceberg}
        className="iceberg" 
        alt="iceberg"
      />
    </div>
  )
}

export default Iceberg;

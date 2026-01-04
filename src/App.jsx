import React, { useState, useRef, useEffect } from "react";
import Boton from "./components/boton/Boton";
import Iceberg from "./components/iceberg/Iceberg";
import Barco from "./components/barco/Barco";

import "./App.css";

// No puede recibir nada, ya que es el padre de todos
function App() {
  // Estado de los filtros
  const [selectedBtn, setSelectedBtn] = useState({
    pC: true,
    pS: true,
    pQ: true,
    male: true,
    female: true,
    class1: true,
    class2: true,
    class3: true,
  });
  const [edadMax, setEdadMax] = useState(70);
  const [edadMin, setEdadMin] = useState(0);

  // Estado del barco
  const [estado, setEstado] = useState("parado"); // "parado" | "navegando" | "chocando" | "partido"

  // Referencias de elememtos del DOM
  const icebergRef = useRef(null);
  const shipRef = useRef(null);

  const toggleFilters = (key) => {
    // Actualizar estado visual del botón - CORREGIDO
    setSelectedBtn((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  // Maneja el cambio del rango mínimo
  const toggleEdadMin = (e) => {
    const value = Math.min(Number(e.target.value), edadMax);
    if (value < edadMax) {
      setEdadMin(value);
    }
  };

  // Maneja el cambio del rango máximo
  const toggleEdadMax = (e) => {
    const value = Math.max(Number(e.target.value), edadMin);
    if (value > edadMin) {
      setEdadMax(value);
    }
  };

  const iniciarAnimacion = () => {
    setEstado("navegando");
  };

  const resetearAnimacion = () => {
    setEstado("parado");
  };

  useEffect(() => {
    if (estado !== "navegando") return;

    const shipEl = shipRef.current;
    const icebergEl = icebergRef.current;
    if (!icebergEl || !shipEl) return;

    return () => {};
  }, [estado]);

  return (
    <>
      <img
        src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2F3.bp.blogspot.com%2F-u-RY6P9CJd8%2FVcU08l44HiI%2FAAAAAAAAAME%2F-GFUEn-CrCA%2Fs1600%2FLuna%252Bmaxresdefault.jpg&f=1&nofb=1&ipt=4b819d492783b7ac56e9d0fc81e41a1b2b2e244bc549de4b0145e770ae1ebd1d"
        alt="fondo"
        className="fondo"
      />
      <header>
        <h1>DASHBOARD TITANIC</h1>
        <div className="all-filters">
          <div className="filters">
            <div className="filter-group clase">
              <h2>CLASE</h2>
              <div className="contenedorBotones">
                <Boton
                  onClick={() => {
                    toggleFilters("class1");
                  }}
                >
                  PRIMERA
                </Boton>
                <Boton
                  onClick={() => {
                    toggleFilters("class2");
                  }}
                >
                  SEGUNDA
                </Boton>
                <Boton
                  onClick={() => {
                    toggleFilters("class3");
                  }}
                >
                  TERCERA
                </Boton>
              </div>
            </div>

            <div className="filter-group sexo">
              <h2>SEXO</h2>
              <div className="contenedorBotones">
                <Boton
                  onClick={() => {
                    toggleFilters("female");
                  }}
                >
                  FEMENINO
                </Boton>
                <Boton
                  onClick={() => {
                    toggleFilters("male");
                  }}
                >
                  MASCULINO
                </Boton>
              </div>
            </div>

            <div className="filter-group puerto">
              <h2>PUERTO</h2>
              <div className="contenedorBotones">
                <Boton
                  onClick={() => {
                    toggleFilters("pC");
                  }}
                >
                  CHERBURGO
                </Boton>
                <Boton
                  onClick={() => {
                    toggleFilters("pQ");
                  }}
                >
                  QUEENSTOWN
                </Boton>
                <Boton
                  onClick={() => {
                    toggleFilters("pS");
                  }}
                >
                  SOUTHAMPTON
                </Boton>
              </div>
            </div>
          </div>

          <div className="filter edad">
            <h2>EDAD</h2>
            <div className="contenedorRangoEdad">
              <div className="rango-contenedor">
                <input
                  type="range"
                  min="0"
                  max="70"
                  onChange={toggleEdadMin}
                  value={edadMin || 0}
                  className="rango-min"
                />
                <input
                  type="range"
                  onChange={toggleEdadMax}
                  min="0"
                  max="70"
                  value={edadMax || 70}
                  className="rango-max"
                />
              </div>
              <div className="valores-rango">
                <p>
                  {edadMin} - {edadMax}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="btnControl">
          <Boton className="botonInicio" onClick={iniciarAnimacion}>
            INICIAR ANIMACIÓN
          </Boton>
          <Boton className="botonReset" onClick={resetearAnimacion}>
            RESETEAR ANIMACIÓN
          </Boton>
        </div>
      </header>
      <main>
        <Iceberg containerRef={icebergRef} />
        <Barco
          estado={estado}
          setEstado={setEstado}
          shipRef={shipRef}
          icebergRef={icebergRef}
          filtros={selectedBtn} 
          edadMin={edadMin}
          edadMax={edadMax}
        />
      </main>
    </>
  );
}

export default App;

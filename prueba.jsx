import React, { useEffect, useRef, useState, useMemo } from "react";
import titanicIzq from "../../img/titanic-izq.png";
import titanicDer from "../../img/titanic-der.png";
import csv from "/titanic.csv";
import "./Barco.css";
import "../../App.css";

function Barco({ estado, setEstado }) {
  const [sexo, setSexo] = useState("Todos");
  const [clase, setClase] = useState("Todas");
  const [puerto, setPuerto] = useState("Todos");
  const [edadMax, setEdadMax] = useState(70);
  const [edadMin, setEdadMin] = useState(0);
  const [datosPasajeros, setDatosPasajeros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Estados del barco
  const [posX, setPosX] = useState(15); // posición desde la derecha
  const [colision, setColision] = useState(false);
  const [barcoPartido, setBarcoPartido] = useState(false);
  const [animacionCompleta, setAnimacionCompleta] = useState(false);

  // Refs DOM
  const shipRef = useRef(null);
  const izqRef = useRef(null);
  const derRef = useRef(null);

  // Cargar datos del CSV desde public
  const parseCSVLine = (line) => {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  useEffect(() => {
    const cargarCSV = async () => {
      try {
        console.log("Cargando CSV...");
        const response = await fetch(csv);

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const csvText = await response.text();
        console.log("CSV cargado, procesando...");

        // Parsear el CSV
        const lines = csvText.split("\n").filter((line) => line.trim() !== "");

        if (lines.length === 0) {
          throw new Error("El archivo CSV está vacío");
        }

        const headers = lines[0].split(",").map((header) => header.trim());

        const datos = lines
          .slice(1)
          .map((line, index) => {
            try {
              const values = parseCSVLine(line);
              const pasajero = {};

              headers.forEach((header, i) => {
                pasajero[header] = values[i] || "";
              });

              return pasajero;
            } catch (error) {
              console.log(`${error} no hay pasajeros`);
            }
          })
          .filter((p) => p !== null && p.PassengerId);

        console.log(`Datos cargados: ${datos.length} pasajeros`);
        setDatosPasajeros(datos);
        setCargando(false);
        setError(null);
      } catch (error) {
        console.error("Error cargando CSV:", error);
        setError(error.message);
        setCargando(false);
      }
    };

    cargarCSV();
  }, []);

  // Efecto para el movimiento hacia la izquierda
  useEffect(() => {
    if (estado !== "navegando" || colision || animacionCompleta) return;

    const velocidad = 2;
    const posicionColision = 300; // Cuando llega a 300px desde la derecha, choca con el iceberg

    const intervalo = setInterval(() => {
      setPosX((prevPos) => {
        const nuevaPos = prevPos + velocidad;
        
        // Detectar colisión
        if (nuevaPos >= posicionColision && !colision) {
          console.log("¡COLISIÓN DETECTADA!");
          setColision(true);
          setEstado("chocando");
          clearInterval(intervalo);
          
          // Esperar un momento y luego partir el barco
          setTimeout(() => {
            setBarcoPartido(true);
            setEstado("partido");
            
            // Después de 3 segundos, hundir completamente
            setTimeout(() => {
              setAnimacionCompleta(true);
            }, 3000);
          }, 500);
          
          return posicionColision;
        }
        
        return nuevaPos;
      });
    }, 30);

    return () => clearInterval(intervalo);
  }, [estado, colision, animacionCompleta, setEstado]);

  // Resetear cuando el estado vuelve a "parado"
  useEffect(() => {
    if (estado === "parado") {
      setPosX(15);
      setColision(false);
      setBarcoPartido(false);
      setAnimacionCompleta(false);
    }
  }, [estado]);

  // Filtro principal
  const pasajerosFiltrados = useMemo(() => {
    if (!datosPasajeros.length || cargando) return [];

    const filtrados = datosPasajeros.filter((pasajero) => {
      const coincideSexo = sexo === "Todos" ? true : pasajero.Sex === sexo;
      const coincideClase =
        clase === "Todas" ? true : pasajero.Pclass === clase;
      const coincidePuerto =
        puerto === "Todos" ? true : pasajero.Embarked === puerto;

      const edad = parseFloat(pasajero.Age) || 0;
      const coincideEdad = edad <= edadMax && edad >= edadMin;

      return coincideSexo && coincideClase && coincidePuerto && coincideEdad;
    });

    return filtrados;
  }, [sexo, clase, puerto, edadMax, edadMin, datosPasajeros, cargando]);

  if (cargando) {
    return <div className="pasajeros">Cargando datos...</div>;
  }

  return (
    <>
      {/* Contenedor principal del barco */}
      <div
        ref={shipRef}
        className={`contenedorBarco ${estado} ${barcoPartido ? 'roto' : ''}`}
        style={{ 
          right: `${posX}px`,
          display: barcoPartido ? 'none' : 'flex'
        }}
      >
        <div className="izq">
          <img src={titanicIzq} alt="Mitad izquierda del Titanic" />
        </div>
        <div className="der">
          <img src={titanicDer} alt="Mitad derecha del Titanic" />
        </div>
      </div>

      {/* Mitades separadas cuando el barco se parte */}
      {barcoPartido && (
        <>
          <div 
            ref={izqRef}
            className="barco-mitad-izq"
            style={{
              right: '300px',
              bottom: '20vh'
            }}
          >
            <img src={titanicIzq} alt="Mitad izquierda del Titanic partida" />
          </div>
          <div 
            ref={derRef}
            className="barco-mitad-der"
            style={{
              right: `calc(300px - ${titanicIzq ? '100px' : '0px'})`,
              bottom: '20vh'
            }}
          >
            <img src={titanicDer} alt="Mitad derecha del Titanic partida" />
          </div>
        </>
      )}

      {/* Pasajeros */}
      <div className="contenedorPasajeros">
        {pasajerosFiltrados
          .map((pasajero) => (
            <div
              key={pasajero.PassengerId}
              className={`pasajeros ${pasajero.Survived === "1" ? 'sobreviviente' : 'muerto'}`}
              title={`${pasajero.Name} - ${pasajero.Survived === "1" ? 'Sobrevivió' : 'Falleció'}`}
            ></div>
          ))}
      </div>
    </>
  );
}

export default Barco;
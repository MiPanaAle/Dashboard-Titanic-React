import React, { useEffect, useRef, useState, useMemo } from "react";
import titanicIzq from "../../img/titanic-izq.png";
import titanicDer from "../../img/titanic-der.png";
import "./Barco.css";

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
  const [posX, setPosX] = useState(0); // posición mientras navega
  const [colision, setColision] = useState(null); // posición donde choca

  // Refs DOM
  const shipRef = useRef(null);
  const icebergRef = useRef(document.querySelector('.iceberg'));

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

        // CORRECCIÓN: Añade la ruta del archivo CSV
        // El archivo debe estar en la carpeta 'public'
        const response = await fetch("/data/titanic.csv"); // ← Ruta relativa desde public

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
    if (estado !== "navegando" || colision) return;

    const velocidad = 3; // Velocidad hacia la izquierda (negativo)
    const intervalo = setInterval(() => {
      setPosX((prevPos) => {
        const nuevaPos = prevPos - velocidad;
        
        // Detectar colisión cuando llegue cerca del iceberg (posición 100px)
        if (nuevaPos <= 100) {
          console.log("¡COLISIÓN DETECTADA!");
          setColision(true);
          setEstado("chocando");
          clearInterval(intervalo);
          return 100; // Posición de colisión
        }
        
        return nuevaPos;
      });
    }, 30);

    return () => clearInterval(intervalo);
  }, [estado, colision, setEstado]);

  // Resetear cuando el estado vuelve a "parado"
  useEffect(() => {
    if (estado === "parado") {
      setPosX(600); // Volver a la posición inicial derecha
      setColision(false);
    }
  }, [estado]);

  // Efecto para el hundimiento
  useEffect(() => {
    if (estado === "chocando") {
      const timer = setTimeout(() => {
        setEstado("hundido");
      }, 3000); // 3 segundos para hundirse completamente
      return () => clearTimeout(timer);
    }
  }, [estado, setEstado]);
  // Función para actualizar filtros desde otros componentes
  const actualizarFiltros = (nuevosFiltros) => {
    console.log("Actualizando filtros:", nuevosFiltros);

    if (nuevosFiltros.clase !== undefined) {
      setClase(nuevosFiltros.clase === "Todas" ? "Todas" : nuevosFiltros.clase);
    }

    if (nuevosFiltros.genero !== undefined) {
      setSexo(nuevosFiltros.sexo === "todos" ? "Todos" : nuevosFiltros.genero);
    }

    if (nuevosFiltros.puerto !== undefined) {
      const puertoMap = {
        pC: "C",
        pQ: "Q",
        pS: "S",
        todos: "Todos",
      };
      setPuerto(puertoMap[nuevosFiltros.puerto] || nuevosFiltros.puerto);
    }

    if (nuevosFiltros.edadMin !== undefined) setEdadMin(nuevosFiltros.edadMin);
    if (nuevosFiltros.edadMax !== undefined) setEdadMax(nuevosFiltros.edadMax);
  };

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

    // console.log(`Filtrados: ${filtrados.length} de ${datosPasajeros.length}`);
    return filtrados;
  }, [sexo, clase, puerto, edadMax, edadMin, datosPasajeros, cargando]);

  if (cargando) {
    return <div className="pasajeros">Cargando datos...</div>;
  }
  return (
    <div
      ref={shipRef}
      className={`contenedorBarco ${estado}`}
      style={{ 
        left: `${posX}px`,
        transition: estado === "navegando" ? "none" : "left 0.3s ease"
      }}
    >
      <div className={`izq ${estado === "hundido" ? "ship-sinking-left" : ""}`}>
        <img src={titanicIzq} alt="Titanic Izquierda" />
      </div>
      <div className={`der ${estado === "chocando" || estado === "hundido" ? "ship-sinking-? ship-sinking-right" : ""}`}>
        <img src={titanicDer} alt="Titanic Derecha" />
      </div>
      <div className="contenedorPasajeros">
        {pasajerosFiltrados
          .filter((pasajero) => pasajero.Survived === "0")
          .map((pasajero) => (
            <div
              key={pasajero.PassengerId}
              className="pasajeros"
              title={`${pasajero.Name}`}
            ></div>
          ))}
      </div>
    </div>
  );
}

export default Barco;

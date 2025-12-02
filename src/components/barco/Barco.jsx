import React, { useEffect, useRef, useState, useMemo } from "react";
import titanicIzq from "../../img/titanic-izq.png";
import titanicDer from "../../img/titanic-der.png";
import "./Barco.css";

function Barco() {
  const [sexo, setSexo] = useState("Todos");
  const [clase, setClase] = useState("Todas");
  const [puerto, setPuerto] = useState("Todos");
  const [edadMax, setEdadMax] = useState(70);
  const [edadMin, setEdadMin] = useState(0);
  const [datosPasajeros, setDatosPasajeros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('')

  // Estados del barco
  const [estado, setEstado] = useState("parado"); // "parado" | "navegando" | "chocando" | "partido"
  const [posX, setPosX] = useState(0); // posición mientras navega
  const [posColision, setPosColision] = useState(null); // posición donde choca

  const xActual = estado === "navegando" ? posX : posColision ?? posX;

  // Refs DOM
  const shipRef = useRef(null);
  const icebergRef = useRef(null);

  // Cargar datos del CSV desde public/

  useEffect(() => {
    const cargarCSV = async () => {
      try {
        console.log("Cargando CSV...");

        // CORRECCIÓN: Añade la ruta del archivo CSV
        // El archivo debe estar en la carpeta 'public'
        const response = await fetch("/titanic.csv"); // ← Ruta relativa desde public

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
              // Manejo mejorado de CSV con comillas y comas dentro de campos
              const values = parseCSVLine(line);
              const pasajero = {};

              headers.forEach((header, i) => {
                pasajero[header] = values[i] || "";
              });

              return pasajero;
            } catch (error) {
            //   console.warn(`Error parseando línea ${index + 2}:`, line);
            //   return null;
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
  useEffect(() => {
    if (estado !== "navegando") return;

    const velocidad = 4; // px por tick
    const intervalo = setInterval(() => {
      setPosX((x) => x + velocidad);
    }, 30);
    console.log(
      setPosX((x) => x + velocidad),
      velocidad
    );
    console.log("navegando");
    return () => clearInterval(intervalo);
  }, [estado]);

  useEffect(() => {
    if (estado !== "navegando") return;

    const shipEl = shipRef.current;
    const icebergEl = icebergRef.current;
    if (!shipEl || !icebergEl) return;

    const shipRect = shipEl.getBoundingClientRect();
    const icebergRect = icebergEl.getBoundingClientRect();
    console.log("iceberg.left", icebergRect.left, shipRect.right);
    if (shipRect.right >= icebergRect.left) {
      const solape = shipRect.right - icebergRect.left;
      const xAjustado = posX - solape;
      // console.log("recalculando posicion;",posX, shipRect.right, solape, icebergRect.left);
      setPosColision(xAjustado);
      setEstado("chocando");
    }
  }, [posX, estado]); // <--- SIEMPRE EXACTAMENTE ESTO

  // Botones
  const isSailing = () => {
    console.log("zarpar", estado);
    setPosX();
    setPosColision(null);
    setEstado("navegando");
  };

  // Función para actualizar filtros desde otros componentes
  const actualizarFiltros = (nuevosFiltros) => {
    console.log("Actualizando filtros:", nuevosFiltros);

    if (nuevosFiltros.clase !== undefined) {
      setClase(clase.clase === "Todas" ? "Todas" : nuevosFiltros.clase);
    }

    if (nuevosFiltros.genero !== undefined) {
      setSexo(sexo.se === "todos" ? "Todos" : nuevosFiltros.genero);
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
    <div className={`contenedorBarco ${isSailing === false ? '' : 'sailing'}`}>
      <div className="izq">
        <img src={titanicIzq} alt="Titaic Izquierada" />
      </div>
      <div className="der">
        <img src={titanicDer} alt="Titaic Derecha" />
      </div>
      <div className="contenedorPasajeros">
        {pasajerosFiltrados
          .filter((pasajero) => pasajero.Survived === 0)
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

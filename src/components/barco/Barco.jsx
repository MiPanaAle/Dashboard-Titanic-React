import React, { useEffect, useRef, useState, useMemo } from "react";
import titanicIzq from "../../img/titanic-izq.png";
import titanicDer from "../../img/titanic-der.png";
import "./Barco.css";

function Barco({ estado, setEstado, icebergRef, shipRef }) {
  const [sexo, setSexo] = useState("Todos");
  const [clase, setClase] = useState("Todas");
  const [puerto, setPuerto] = useState("Todos");
  const [edadMax, setEdadMax] = useState(70);
  const [edadMin, setEdadMin] = useState(0);
  const [datosPasajeros, setDatosPasajeros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Estados del barco
  const [posX, setPosX] = useState(15); // Posición inicial en la derecha
  const [colision, setColision] = useState(0); // posición donde choca
  const [barcoPartido, setBarcoPartido] = useState(false);
  const [animacionCompleta, setAnimacionCompleta] = useState(false);

  // Refs a los elemntos del DOM

  const izqRef = useRef(null);
  const derRef = useRef(null);

  console.log("posicion iceberg: " + icebergRef.getBoundingClientRect);

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

  // Carga CSV
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

  // Efecto para el movimiento hacia la derecha
  useEffect(() => {
    if (estado !== "navegando" || colision || animacionCompleta)
      return console.log("el barco está parado");

    const velocidad = 2;
    const intervalo = setInterval(() => {
      setPosX((prevPos) => {
        const nuevaPos = prevPos + velocidad;
        // Verificar colisión
        setTimeout(() => {
          if (icebergRef.current && shipRef.current) {
            const icebergRect = icebergRef.getBoundingClientRect;
            const shipRect = shipRef.getBoundingClientRect;
            console.log(
              "posicion iceberg: " + icebergRef.getBoundingClientRect
            );
            console.log("posicion barco: " + shipRef.getBoundingClientRect);

            // Detectar colisión
            if (shipRect >= icebergRect && !colision) {
              console.log("¡COLISIÓN CON ICEBERG! - BARCO DETENIDO");

              // Detener el barco
              clearInterval(intervalo);

              // Actualizar estados
              setColision(true);
              setColision(prevPos); // Guardar posición de colisión
              setEstado("chocando");

              setTimeout(() => {
                setBarcoPartido(true);
                setEstado("partido");
              }, 500);
              return prevPos; // No avanza más, se queda donde chocó
            }
          }
        }, 0);

        return nuevaPos;
      });
    }, 30);

    return () => clearInterval(intervalo);
  }, [animacionCompleta, colision, estado, icebergRef, setEstado, shipRef]);

  // Efecto para animar las partes separadas
  useEffect(() => {
    if (barcoPartido && izqRef.current && derRef.current) {
      const izquierda = izqRef.current;
      const derecha = derRef.current;

      // Posición inicial (juntas en el punto de colisión)
      izquierda.style.left = `${colision}px`;
      derecha.style.left = `${colision}px`;

      // Animar separación
      setTimeout(() => {
        // Mitad izquierda retrocede
        izquierda.style.transition = "all 1.5s ease-out";
        izquierda.style.left = `${colision - 200}px`;
        izquierda.style.transform = "rotate(-10deg)";

        // Mitad derecha avanza
        derecha.style.transition = "all 1.5s ease-out";
        derecha.style.left = `${colision + 200}px`;
        derecha.style.transform = "rotate(10deg)";
      }, 100);
    }
  }, [barcoPartido, colision]);

  // Resetear cuando el estado vuelve a "parado"
  useEffect(() => {
    if (estado === "parado") {
      setPosX(0); // Volver a la posición inicial derecha
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

    console.log(`Filtrados: ${filtrados.length} de ${datosPasajeros.length}`);
    return filtrados;
  }, [sexo, clase, puerto, edadMax, edadMin, datosPasajeros, cargando]);

  if (cargando) {
    return <div className="pasajeros">Cargando datos...</div>;
  }

  return (
    <div>
      <div
        ref={shipRef}
        className={`contenedorBarco ${estado}`}
        style={{
          left: `${posX}px`,
          transition: estado === "navegando" ? "none" : "left 0.5s ease",
        }}
      >
        <div
          className={`izq ${estado === "hundido" ? "ship-sinking-left" : ""}`}
        >
          <img src={titanicIzq} alt="Titanic" />
        </div>
        <div
          className={`der ${
            estado === "chocando" || estado === "hundido" ? "ship-sinking" : ""
          }`}
        >
          <img src={titanicDer} alt="Titanic" />
        </div>
      </div>

      {barcoPartido && (
        <>
          <div
            ref={izqRef}
            className="barco-mitad-izq"
            style={{
              left: `${posX}px`, // Usa la posición actual de colisión
              bottom: "20vh",
            }}
          >
            <img src={titanicIzq} alt="Mitad izquierda del Titanic partida" />
          </div>
          <div
            ref={derRef}
            className="barco-mitad-der"
            style={{
              left: `${posX}px`, // Usa la posición actual de colisión
              bottom: "20vh",
            }}
          >
            <img src={titanicDer} alt="Mitad derecha del Titanic partida" />
          </div>
        </>
      )}

      <div className="contenedorPasajeros">
        {pasajerosFiltrados.map((pasajero) => (
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

/* eslint-disable no-unused-vars */
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

  // Estados del barco
  const [posX, setPosX] = useState(15); // Posición inicial en la derecha
  const [colision, setColision] = useState(0); // posición donde choca
  const [barcoPartido, setBarcoPartido] = useState(false);
  const [animacionCompleta, setAnimacionCompleta] = useState(false);

  // Refs a los elemntos del DOM
  const izqRef = useRef(null);
  const derRef = useRef(null);

  // Estados de pasajeros par-impar
  const [idPar, setIdPar] = useState([]);
  const [idImpar, setidImpar] = useState([]);

  // Cargar datos del CSV desde /public
  useEffect(() => {
    const cargarCSV = async () => {
      try {
        const response = await fetch("/titanicdata.csv");

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const csvText = await response.text();
        console.log(csvText);

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
              // Manejo simple de CSV - asumiendo que no hay comas en los campos
              const values = line
                .split(",")
                .map((val) => val.trim().replace(/^"|"$/g, ""));
              const pasajero = {};

              headers.forEach((header, i) => {
                pasajero[header] = values[i] || "";
              });

              return pasajero;
            } catch (error) {
              return null;
            }
          })
          .filter((p) => p !== null && p.PassengerId);

        setDatosPasajeros(datos);
        setCargando(false);
      } catch (error) {
        setCargando(false);
      }
      const processCSV = (csvText) => {
        const lines = csvText.split("\n");
        const headers = lines[0].split(",");

        const idPar = [];
        const idImpar = [];

        //for(let i= 1; i < lines.length; i++){}
      };
    };

    cargarCSV();
  }, []);

  // Efecto para el movimiento hacia la derecha
  useEffect(() => {
    if (estado !== "navegando" || colision || animacionCompleta) return;

    const velocidad = 2;
    const intervalo = setInterval(() => {
      setPosX((prevPos) => {
        const nuevaPos = prevPos + velocidad;
        // Verificar colisión
        setTimeout(() => {
          if (icebergRef.current && shipRef.current) {
            const icebergRect = icebergRef.getBoundingClientRect;
            const shipRect = shipRef.getBoundingClientRect;

            // Detectar colisión
            if (shipRect >= icebergRect && !colision) {
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
    if (estado !== "navegando") return;

    const velocidad = 2;

    const intervalo = setInterval(() => {
      setPosX((prevPos) => {
        const nuevaPos = prevPos + velocidad;
        // Verificar colisión
        setTimeout(() => {
          if (icebergRef.current && shipRef.current) {
            const icebergRect = icebergRef.current;
            const shipRect = shipRef.current;

            // Detectar colisión
            if (
              shipRect.getBoundingClientRect().right >=
                icebergRect.getBoundingClientRect().left &&
              !colision
            ) {
              // Detener el barco
              clearInterval(intervalo);

              // Actualizar estados
              setColision(true);
              setColision(prevPos); // Guardar posición de colisión
              setEstado("chocando");

              setTimeout(() => {
                setBarcoPartido(true);
                setEstado("partido");
              }, 5000);
              return prevPos; // No avanza más, se queda donde chocó
            }
          }
        }, 0);

        return nuevaPos;
      });
    }, 30);

    return () => clearInterval(intervalo);
  }, [animacionCompleta, colision, estado, icebergRef, setEstado, shipRef]);

  const actualizarFiltros = (nuevosFiltros) => {
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

  // Filtrando pasajeros
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

  return (
    <div
      ref={shipRef}
      className="contenedorBarco"
      style={{
        left: `${posX}px`,
        transition: estado === "navegando" ? "none" : "left 0.5s ease",
      }}
    >
      {/* MITAD IZQUIERDA */}
      <div className="izq">
        <img src={titanicIzq} alt="Titanic" className="titanic" />

        {/* PASAJEROS IZQUIERDA */}
        <div className="contenedorPasajeros">
          {pasajerosFiltrados
            .filter((pasajero, index) => index % 2 === 0) // Pares van a la izquierda
            .map((pasajero) => (
              <div
                key={pasajero.PassengerId}
                className={`pasajeros ${
                  pasajero.Survived === "1" ? "vivo" : "muerto"
                }`}
                title={`${pasajero.Name} - ${
                  pasajero.Survived === "1" ? "Sobrevivió" : "Murió"
                }`}
              ></div>
            ))}
        </div>
      </div>

      {/* MITAD DERECHA */}
      <div className={`izq ${estado === "chocando" ? "ship-sinking" : ""}`}>
        <img
          src={titanicDer}
          alt="Titanic"
          className={`titanic`}
        />

        {/* PASAJEROS DERECHA */}
        <div className="contenedorPasajeros">
          {pasajerosFiltrados
            .filter((pasajero, index) => index % 2 === 1) // Impares van a la derecha
            .map((pasajero) => (
              <div
                key={pasajero.PassengerId}
                className={`pasajeros ${
                  pasajero.Survived === "1" ? "vivo" : "muerto"
                }`}
                title={`${pasajero.Name} - ${
                  pasajero.Survived === "1" ? "Sobrevivió" : "Murió"
                }`}
              ></div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Barco;

import { useState, useEffect } from "react";
import axios from "axios";

const ReservaForm = () => {
  const [servicios, setServicios] = useState([]);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [servicioSeleccionado, setServicioSeleccionado] = useState("");
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:5000/api/servicios")
      .then((res) => setServicios(res.data))
      .catch((error) => console.error("❌ Error al obtener servicios:", error));
  }, []);

  useEffect(() => {
    if (fecha && servicioSeleccionado) {
      axios.get(`http://localhost:5000/api/citas/disponibles?fecha=${fecha}&servicio=${servicioSeleccionado}`)
        .then((res) => setHorariosDisponibles(res.data))
        .catch((error) => console.error("❌ Error al obtener horarios:", error));
    }
  }, [fecha, servicioSeleccionado]);

  const handleReserva = (e) => {
    e.preventDefault();
    setCargando(true);

    let telefonoFormateado = telefono.startsWith("34") ? telefono : `34${telefono}`;

    const nuevaCita = { nombre, telefono: telefonoFormateado, fecha, hora, servicio: servicioSeleccionado };

    axios.post("http://localhost:5000/api/citas", nuevaCita)
      .then((res) => {
        setMensaje("✅ ¡Tu cita ha sido reservada con éxito!");
        setNombre("");
        setTelefono("");
        setFecha("");
        setHora("");
        setServicioSeleccionado("");
        setHorariosDisponibles([]);
      })
      .catch(() => setMensaje("❌ Hubo un error al reservar la cita. Inténtalo de nuevo."))
      .finally(() => setCargando(false));
  };

  return (
    <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-gray-700 text-center">Formulario de Reserva</h2>

      {mensaje && (
        <div className={`mb-4 p-3 rounded text-white text-center transition-opacity duration-500 ${
          mensaje.includes("✅") ? "bg-green-500" : "bg-red-500"
        }`}>
          {mensaje}
        </div>
      )}

      <form onSubmit={handleReserva} className="space-y-4">
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-gray-100 focus:ring focus:ring-blue-300"
          required
        />
        <input
          type="tel"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => {
            let value = e.target.value.replace(/\D/g, "");
            setTelefono(value);
          }}
          className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-gray-100 focus:ring focus:ring-blue-300"
          required
        />
        <select
          value={servicioSeleccionado}
          onChange={(e) => setServicioSeleccionado(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-gray-100 focus:ring focus:ring-blue-300"
          required
        >
          <option value="">Selecciona un servicio</option>
          {servicios.map((serv) => (
            <option key={serv.id} value={serv.nombre}>
              {serv.nombre} ({serv.duracion} min)
            </option>
          ))}
        </select>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-gray-100 focus:ring focus:ring-blue-300"
          required
        />
        <select
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 bg-gray-100 focus:ring focus:ring-blue-300"
          required
        >
          <option value="">Selecciona una hora</option>
          {horariosDisponibles.map((h, index) => (
            <option key={index} value={h}>{h}</option>
          ))}
        </select>

        <button
          type="submit"
          className={`w-full p-3 rounded-lg text-white transition ${
            cargando ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={cargando}
        >
          {cargando ? "Reservando..." : "Reservar Cita"}
        </button>
      </form>
    </div>
  );
};

export default ReservaForm;

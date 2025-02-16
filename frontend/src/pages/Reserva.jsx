import { useState, useEffect } from "react";
import axios from "axios";

export default function Reserva() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [servicio, setServicio] = useState("");
  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [mensaje, setMensaje] = useState("");

  // Obtener la lista de servicios disponibles desde el backend
  useEffect(() => {
    axios.get("http://localhost:5000/api/servicios")
      .then((res) => setServiciosDisponibles(res.data))
      .catch((error) => console.error("Error al cargar servicios:", error));
  }, []);

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nombre || !telefono || !fecha || !hora || !servicio) {
      setMensaje("⚠️ Todos los campos son obligatorios.");
      return;
    }

    const nuevaCita = { nombre, telefono, fecha, hora, servicio };

    try {
      const res = await axios.post("http://localhost:5000/api/citas", nuevaCita);
      setMensaje("✅ Cita reservada con éxito.");
      setNombre("");
      setTelefono("");
      setFecha("");
      setHora("");
      setServicio("");
    } catch (error) {
      setMensaje(`❌ Error: ${error.response?.data?.error || "No se pudo reservar la cita."}`);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-blue-600 mb-4">Reservar Cita</h2>

      {mensaje && <p className="mb-4 text-center font-semibold">{mensaje}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" 
          placeholder="Nombre" 
          value={nombre} 
          onChange={(e) => setNombre(e.target.value)}
          className="w-full p-2 border rounded"
          required 
        />

        <input 
          type="tel" 
          placeholder="Teléfono" 
          value={telefono} 
          onChange={(e) => setTelefono(e.target.value)}
          className="w-full p-2 border rounded"
          required 
        />

        <input 
          type="date" 
          value={fecha} 
          onChange={(e) => setFecha(e.target.value)}
          className="w-full p-2 border rounded"
          required 
        />

        <input 
          type="time" 
          value={hora} 
          onChange={(e) => setHora(e.target.value)}
          className="w-full p-2 border rounded"
          required 
        />

        <select 
          value={servicio} 
          onChange={(e) => setServicio(e.target.value)}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Seleccione un servicio</option>
          {serviciosDisponibles.map((s) => (
            <option key={s.id} value={s.nombre}>{s.nombre} ({s.duracion} min)</option>
          ))}
        </select>

        <button 
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          Reservar Cita
        </button>
      </form>
    </div>
  );
}

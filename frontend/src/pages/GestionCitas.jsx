import { useState, useEffect } from "react";
import axios from "axios";

export default function GestionCitas() {
  const [citas, setCitas] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [servicioSeleccionado, setServicioSeleccionado] = useState("");
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  
  useEffect(() => {
    cargarCitas();
    axios.get("http://localhost:5000/api/servicios").then((res) => setServicios(res.data));
  }, []);

  const cargarCitas = () => {
    axios.get("http://localhost:5000/api/citas").then((res) => setCitas(res.data));
  };

  const handleCrearCita = (e) => {
    e.preventDefault();
    axios.post("http://localhost:5000/api/citas", {
      nombre,
      telefono,
      fecha,
      hora,
      servicio: servicioSeleccionado,
    }).then(() => {
      cargarCitas();
      setNombre("");
      setTelefono("");
      setFecha("");
      setHora("");
      setServicioSeleccionado("");
    });
  };

  const handleEliminarCita = (id) => {
    axios.delete(`http://localhost:5000/api/citas/${id}`).then(() => cargarCitas());
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-12">
      <h2 className="text-xl font-bold text-blue-600 mb-4">📅 Gestión de Citas</h2>
      
      {/* Formulario de creación */}
      <form onSubmit={handleCrearCita} className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className="border p-2 rounded" required />
        <input type="tel" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="border p-2 rounded" required />
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="border p-2 rounded" required />
        <select value={servicioSeleccionado} onChange={(e) => setServicioSeleccionado(e.target.value)} className="border p-2 rounded" required>
          <option value="">Selecciona un servicio</option>
          {servicios.map((serv) => (
            <option key={serv.id} value={serv.nombre}>{serv.nombre} ({serv.duracion} min)</option>
          ))}
        </select>
        <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="border p-2 rounded" required />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Crear Cita</button>
      </form>
      
      {/* Tabla de citas */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-blue-100">
            <th className="border p-2">Nombre</th>
            <th className="border p-2">Teléfono</th>
            <th className="border p-2">Fecha</th>
            <th className="border p-2">Hora</th>
            <th className="border p-2">Servicio</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {citas.map((cita) => (
            <tr key={cita.id} className="border">
              <td className="border p-2">{cita.nombre}</td>
              <td className="border p-2">{cita.telefono}</td>
              <td className="border p-2">{cita.fecha}</td>
              <td className="border p-2">{cita.hora}</td>
              <td className="border p-2">{cita.servicio}</td>
              <td className="border p-2 flex gap-2">
                <button className="bg-red-600 text-white p-1 rounded hover:bg-red-700" onClick={() => handleEliminarCita(cita.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

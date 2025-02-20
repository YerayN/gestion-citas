import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [token]);

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", credentials);
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
    } catch (error) {
      alert("Error de autenticación: " + (error.response?.data?.error || "Intenta nuevamente"));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  if (!token) {
    return (
      <div className="max-w-sm mx-auto bg-white p-6 rounded-lg shadow-lg mt-12 text-center">
        <h2 className="text-xl font-bold text-blue-600 mb-4">🔑 Iniciar Sesión</h2>
        <input
          type="text"
          placeholder="Usuario"
          className="border p-2 w-full rounded mb-2"
          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="border p-2 w-full rounded mb-2"
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        />
        <button className="bg-blue-600 text-white p-2 w-full rounded hover:bg-blue-700" onClick={handleLogin}>
          Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-lg mt-12 flex flex-col items-center">
      <h2 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
        📊 Panel de Control
      </h2>

      {/* Grid de opciones */}
      <div className="grid grid-cols-2 gap-4 w-full">
        <button
        className="bg-blue-600 text-white p-4 rounded-lg shadow-md flex flex-col items-center hover:bg-blue-700 transition"
        onClick={() => navigate("/admin/gestionar-citas")} // 🔹 Asegúrate de que la ruta es la misma que en `App.jsx`
      >
        📅 Gestionar Citas
      </button>


        <button
          className="bg-blue-600 text-white p-4 rounded-lg shadow-md flex flex-col items-center hover:bg-blue-700 transition"
          onClick={() => navigate("/admin/registrar-pago")}
        >
          💳 Registrar Pago
        </button>

        <button
          className="bg-blue-600 text-white p-4 rounded-lg shadow-md flex flex-col items-center hover:bg-blue-700 transition"
          onClick={() => navigate("/admin/generar-informes")}
        >
          📑 Generar Reportes
        </button>

        <button
          className="bg-blue-600 text-white p-4 rounded-lg shadow-md flex flex-col items-center hover:bg-blue-700 transition"
          onClick={() => navigate("/admin/configuracion")}
        >
          ⚙️ Configuración
        </button>
      </div>

      {/* Botón de cerrar sesión centrado abajo */}
      <div className="mt-6 w-full flex justify-center">
        <button className="bg-red-600 text-white p-2 rounded hover:bg-red-700" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

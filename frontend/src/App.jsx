import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Inicio from "./pages/Inicio";
import Reserva from "./pages/Reserva";
import AdminPanel from "./pages/AdminPanel";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-blue-500 flex flex-col">
        
        {/* Navbar fijo en la parte superior */}
        <Navbar />

        {/* Ajustamos el margen para que el contenido no quede oculto debajo del navbar */}
         <div className="mt-16 flex-1 flex justify-center items-center">
        <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-6">
            <Routes>
              <Route path="/" element={<Inicio />} />
              <Route path="/reservar" element={<Reserva />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </div>
        </div>

        {/* Footer fijo abajo */}
        <footer className="bg-blue-600 text-white text-center p-4 shadow-md">
          © 2025 Gestión de Citas - Todos los derechos reservados
        </footer>
      </div>
    </Router>
  );
}

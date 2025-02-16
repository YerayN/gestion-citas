import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Inicio from "./pages/Inicio";
import Reserva from "./pages/Reserva";
import AdminPanel from "./pages/AdminPanel";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <nav className="bg-blue-600 text-white p-4 flex justify-center gap-4">
          <Link to="/" className="hover:underline">Inicio</Link>
          <Link to="/reservar" className="hover:underline">Reservar Cita</Link>
          <Link to="/admin" className="hover:underline">Panel de Control</Link>
        </nav>

        <div className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/reservar" element={<Reserva />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

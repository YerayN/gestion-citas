import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">
        {/* Logo más alineado a la izquierda */}
        <h1 className="text-blue-600 text-lg font-bold ml-4">Gestión de Citas</h1>

        {/* Menú más espaciado y alineado a la derecha */}
        <div className="flex space-x-8 mr-0">
          <Link to="/" className="text-gray-900 hover:text-blue-600 transition font-medium">Inicio</Link>
          <Link to="/reservar" className="text-gray-900 hover:text-blue-600 transition font-medium">Reservar Cita</Link>
          <Link to="/admin" className="text-gray-900 hover:text-blue-600 transition font-medium">Panel de Control</Link>
        </div>
      </div>
    </nav>
  );
}

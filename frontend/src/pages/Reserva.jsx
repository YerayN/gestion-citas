import ReservaForm from "../components/ReservaForm";

export default function Reserva() {
  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-blue-600 mb-4">Reservar Cita</h2>
      <ReservaForm />  {/* ✅ Ahora el formulario se muestra correctamente */}
    </div>
  );
}

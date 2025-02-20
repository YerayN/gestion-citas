const express = require("express");
const cors = require("cors");
const appointmentsRoutes = require("./routes/appointments");
const paymentsRoutes = require("./routes/payments");
const { router: authRoutes, verificarToken } = require("./routes/auth");
const servicesRoutes = require("./routes/services");

const app = express();
app.use(cors());
app.use(express.json());

// Rutas públicas
app.use("/api/auth", authRoutes);
app.use("/api/servicios", servicesRoutes);
app.use("/api/citas", appointmentsRoutes);

// Rutas protegidas
app.use("/api/pagos", verificarToken, paymentsRoutes);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

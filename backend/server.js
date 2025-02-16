// Importaciones necesarias
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Inicialización de Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Importar rutas
const citasRoutes = require('./routes/appointments');
app.use('/api/citas', citasRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente 🚀');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

const express = require('express');
const router = express.Router();
const db = require("../database/db");

// Función para obtener datos de la cita
const obtenerCita = (citaId) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT nombre, fecha, hora, servicio FROM citas WHERE id = ?`, [citaId], (err, cita) => {
            if (err) return reject("Error al buscar la cita.");
            if (!cita) return reject("Cita no encontrada.");
            resolve(cita);
        });
    });
};

// Función para obtener el precio del servicio
const obtenerPrecioServicio = (servicioNombre) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT precio FROM servicios WHERE nombre = ?`, [servicioNombre], (err, servicio) => {
            if (err) return reject("Error al obtener el precio del servicio.");
            if (!servicio) return reject("Servicio no encontrado.");
            resolve(servicio.precio);
        });
    });
};

// Obtener todos los pagos registrados
router.get('/', async (req, res) => {
    try {
        db.all(`SELECT * FROM pagos`, [], (err, rows) => {
            if (err) {
                console.error("❌ Error al obtener los pagos:", err.message);
                return res.status(500).json({ error: "Error al obtener los pagos." });
            }
            res.json(rows);
        });
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor." });
    }
});


// Función para registrar el pago
const registrarPago = (cliente, fecha, hora, servicio, cantidad, metodoPago) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO pagos (cliente, fecha, hora, servicio, cantidad, metodo) VALUES (?, ?, ?, ?, ?, ?)`,
            [cliente, fecha, hora, servicio, cantidad, metodoPago],
            function (err) {
                if (err) {
                    console.error("❌ Error en la inserción SQL:", err.message);  // <-- Agregado para depuración
                    return reject("Error al registrar el pago.");
                }
                resolve(this.lastID);
            }
        );
    });
};

// Endpoint para registrar pagos
router.post('/registrar', async (req, res) => {
    const { citaId, metodoPago } = req.body;

    if (!citaId || !metodoPago) {
        return res.status(400).json({ error: "El ID de la cita y el método de pago son obligatorios." });
    }

    if (!["Efectivo", "Tarjeta"].includes(metodoPago)) {
        return res.status(400).json({ error: "El método de pago debe ser 'Efectivo' o 'Tarjeta'." });
    }

    try {
        // Obtener datos de la cita
        const cita = await obtenerCita(citaId);

        // Obtener el precio del servicio
        const cantidad = await obtenerPrecioServicio(cita.servicio);

        // Registrar el pago en la base de datos
        const idPago = await registrarPago(cita.nombre, cita.fecha, cita.hora, cita.servicio, cantidad, metodoPago);

        res.json({
            mensaje: "✅ Pago registrado con éxito.",
            idPago,
            cliente: cita.nombre,
            fecha: cita.fecha,
            hora: cita.hora,
            servicio: cita.servicio,
            cantidad,
            metodoPago
        });

    } catch (error) {
        console.error("❌", error);
        res.status(500).json({ error });
    }
});

module.exports = router;

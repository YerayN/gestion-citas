const express = require('express');
const router = express.Router();
const { getCitas, createCita, updateCita, deleteCita } = require('../controllers/appointmentController');
const db = require("../database/db");

// Definir rutas para gestionar citas
router.get('/', getCitas);
router.post('/', createCita);
router.put('/:id', updateCita);
router.delete('/:id', deleteCita);

// Log cuando la solicitud llega
router.get("/servicios", (req, res) => {
    console.log("📢 Se ha recibido una solicitud GET en /api/servicios");

    db.all("SELECT id, nombre, duracion, precio FROM servicios", [], (err, rows) => {
        if (err) {
            console.error("❌ Error al obtener servicios:", err.message);
            return res.status(500).json({ error: "Error al obtener los servicios" });
        }

        console.log("🔍 Datos obtenidos de la base de datos:", rows);
        res.json(rows);
    });
});

// Nueva ruta: Obtener horarios disponibles para una fecha y servicio
router.get('/disponibles', (req, res) => {
    const { fecha, servicio } = req.query;

    if (!fecha || !servicio) {
        return res.status(400).json({ error: "Fecha y servicio son obligatorios" });
    }

    db.get('SELECT duracion FROM servicios WHERE nombre = ?', [servicio], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(400).json({ error: "El servicio no existe" });

        const duracion = row.duracion;
        const horarioApertura = 9 * 60; // 9:00 AM en minutos
        const horarioCierre = 18 * 60;  // 18:00 PM en minutos
        const intervalo = 30; // Intervalo entre citas

        let horariosDisponibles = [];
        
        for (let minutos = horarioApertura; minutos + duracion <= horarioCierre; minutos += intervalo) {
            let horaInicio = `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
            let horaFin = `${String(Math.floor((minutos + duracion) / 60)).padStart(2, "0")}:${String((minutos + duracion) % 60).padStart(2, "0")}`;

            horariosDisponibles.push({ horaInicio, horaFin });
        }

        db.all('SELECT hora, hora_fin FROM citas WHERE fecha = ?', [fecha], (err, citas) => {
            if (err) return res.status(500).json({ error: err.message });

            const horariosOcupados = citas.map(cita => ({ inicio: cita.hora, fin: cita.hora_fin }));

            const horariosFiltrados = horariosDisponibles.filter(horario => {
                return !horariosOcupados.some(cita => 
                    (horario.horaInicio >= cita.inicio && horario.horaInicio < cita.fin) || 
                    (cita.inicio >= horario.horaInicio && cita.inicio < horario.horaFin)
                );
            });

            res.json(horariosFiltrados.map(h => h.horaInicio));
        });
    });
});


module.exports = router;

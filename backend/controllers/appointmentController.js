const db = require('../database/db');
const { crearEvento } = require('./googleCalendarController');
const { actualizarEvento } = require('./googleCalendarController');
const { eliminarEvento } = require('./googleCalendarController'); // Importar la función

// Obtener todas las citas
const getCitas = (req, res) => {
    db.all('SELECT * FROM citas', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// Crear una nueva cita y registrarla en Google Calendar
const createCita = async (req, res) => {
    const { nombre, telefono, fecha, hora, servicio } = req.body;
    if (!nombre || !telefono || !fecha || !hora || !servicio) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        // Insertar cita en SQLite
        const query = 'INSERT INTO citas (nombre, telefono, fecha, hora, servicio) VALUES (?, ?, ?, ?, ?)';
        db.run(query, [nombre, telefono, fecha, hora, servicio], async function (err) {
            if (err) return res.status(500).json({ error: err.message });

            const cita = { id: this.lastID, nombre, telefono, fecha, hora, servicio };

            // 🔹 Crear evento en Google Calendar y guardar el ID en la base de datos
            try {
                const eventId = await crearEvento(cita);
                db.run('UPDATE citas SET google_event_id = ? WHERE id = ?', [eventId, cita.id]);
                cita.google_event_id = eventId;
            } catch (error) {
                console.error('⚠️ No se pudo registrar en Google Calendar, pero la cita se guardó en la base de datos.');
            }

            res.json(cita);
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar una cita en la base de datos y en Google Calendar
const updateCita = (req, res) => {
    const { nombre, telefono, fecha, hora, servicio } = req.body;
    const { id } = req.params;

    // Obtener el ID del evento de Google Calendar
    db.get('SELECT google_event_id FROM citas WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row || !row.google_event_id) return res.status(400).json({ error: 'No se encontró el evento en Google Calendar' });

        const eventId = row.google_event_id;

        const query = 'UPDATE citas SET nombre = ?, telefono = ?, fecha = ?, hora = ?, servicio = ? WHERE id = ?';
        db.run(query, [nombre, telefono, fecha, hora, servicio, id], function (err) {
            if (err) return res.status(500).json({ error: err.message });

            // 🔄 Actualizar el evento en Google Calendar
            actualizarEvento(eventId, { nombre, telefono, fecha, hora, servicio });

            res.json({ message: `✅ Cita con ID ${id} actualizada`, google_event_id: eventId });
        });
    });
};

// Eliminar una cita de la base de datos y de Google Calendar
const deleteCita = (req, res) => {
    const { id } = req.params;

    // Obtener el ID del evento de Google Calendar
    db.get('SELECT google_event_id FROM citas WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row || !row.google_event_id) return res.status(400).json({ error: 'No se encontró el evento en Google Calendar' });

        const eventId = row.google_event_id;

        // 🔹 Eliminar el evento en Google Calendar antes de eliminar la cita
        eliminarEvento(eventId).then(() => {
            const query = 'DELETE FROM citas WHERE id = ?';
            db.run(query, [id], function (err) {
                if (err) return res.status(500).json({ error: err.message });

                res.json({ message: `🗑️ Cita con ID ${id} eliminada correctamente`, google_event_id: eventId });
            });
        });
    });
};

module.exports = { getCitas, createCita, updateCita, deleteCita };

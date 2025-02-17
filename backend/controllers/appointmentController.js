const db = require('../database/db');
const { crearEvento, actualizarEvento, eliminarEvento } = require('./googleCalendarController');
const { enviarMensajeWhatsApp } = require('../services/whatsappService');

// Obtener todas las citas
const getCitas = (req, res) => {
    db.all('SELECT * FROM citas', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// Crear una nueva cita
const createCita = async (req, res) => {
    let { nombre, telefono, fecha, hora, servicio } = req.body;

    if (!nombre || !telefono || !fecha || !hora || !servicio) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Asegurar que el teléfono tenga el prefijo "34"
    if (!telefono.startsWith("34")) {
        telefono = `34${telefono}`;
    }

    try {
        db.get('SELECT duracion FROM servicios WHERE nombre = ?', [servicio], async (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(400).json({ error: 'El servicio no existe' });

            const [horaStr, minStr] = hora.split(":");
            const totalMinutos = parseInt(horaStr) * 60 + parseInt(minStr) + row.duracion;
            const horaFin = `${String(Math.floor(totalMinutos / 60)).padStart(2, "0")}:${String(totalMinutos % 60).padStart(2, "0")}`;

            // Verificar disponibilidad
            const disponibilidadQuery = `
                SELECT * FROM citas
                WHERE fecha = ?
                AND (
                    (? >= hora AND ? < hora_fin)
                    OR (hora >= ? AND hora < ?)
                )
            `;
            db.all(disponibilidadQuery, [fecha, hora, horaFin, hora, horaFin], (err, citas) => {
                if (err) return res.status(500).json({ error: err.message });
                if (citas.length > 0) return res.status(400).json({ error: 'El horario no está disponible. Elige otra hora.' });

                // Insertar cita en la base de datos
                db.run(
                    'INSERT INTO citas (nombre, telefono, fecha, hora, hora_fin, servicio) VALUES (?, ?, ?, ?, ?, ?)',
                    [nombre, telefono, fecha, hora, horaFin, servicio],
                    function (err) {
                        if (err) return res.status(500).json({ error: err.message });

                        const cita = {
                            id: this.lastID,
                            nombre,
                            telefono,
                            fecha,
                            hora,
                            horaFin,
                            servicio
                        };

                        console.log("✅ Cita creada en la base de datos:", cita);

                        // 🔹 Agregar cita a Google Calendar
                        crearEvento(cita).then((eventoId) => {
                            if (eventoId) {
                                console.log(`📅 Evento creado en Google Calendar: ${eventoId}`);
                                db.run('UPDATE citas SET google_event_id = ? WHERE id = ?', [eventoId, cita.id]);
                            } else {
                                console.error("❌ No se pudo obtener un google_event_id");
                            }
                        }).catch(error => console.error("❌ Error en Google Calendar:", error));

                        // 🔹 Enviar mensaje de WhatsApp
                        try {
                            const mensaje = `📅 Hola ${nombre}, tu cita para *${servicio}* está confirmada.\n📆 Fecha: ${fecha}\n🕒 Hora: ${hora}\n¡Te esperamos!`;
                            console.log(`📨 Intentando enviar mensaje a ${telefono}...`);
                            enviarMensajeWhatsApp(telefono, mensaje);
                            console.log(`✅ Mensaje enviado correctamente a ${telefono}`);
                        } catch (error) {
                            console.error("⚠️ No se pudo enviar el mensaje de WhatsApp.", error);
                        }

                        res.json(cita);
                    }
                );
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = { createCita };


// Actualizar una cita
const updateCita = (req, res) => {
    const { nombre, telefono, fecha, hora, servicio } = req.body;
    const { id } = req.params;

    db.get('SELECT google_event_id FROM citas WHERE id = ?', [id], async (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row || !row.google_event_id) return res.status(400).json({ error: 'No se encontró el evento en Google Calendar' });

        try {
            await actualizarEvento(row.google_event_id, { nombre, telefono, fecha, hora, servicio });
        } catch (error) {
            console.error('❌ Error al actualizar el evento en Google Calendar:', error.response?.data || error.message);
            return res.status(500).json({ error: 'No se pudo actualizar el evento en Google Calendar' });
        }

        db.run('UPDATE citas SET nombre = ?, telefono = ?, fecha = ?, hora = ?, servicio = ? WHERE id = ?',
            [nombre, telefono, fecha, hora, servicio, id], function (err) {
            if (err) return res.status(500).json({ error: err.message });

            const mensaje = `🔄 Hola ${nombre}, tu cita ha sido *modificada*.\n📆 Nueva fecha: ${fecha}\n🕒 Nueva hora: ${hora}\n📌 Servicio: ${servicio}`;
            enviarMensajeWhatsApp(telefono, mensaje);
            res.json({ message: `✅ Cita con ID ${id} actualizada`, google_event_id: row.google_event_id });
        });
    });
};

// Eliminar una cita
const deleteCita = (req, res) => {
    const { id } = req.params;

    db.get('SELECT google_event_id, nombre, telefono, fecha, hora, servicio FROM citas WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row || !row.google_event_id) return res.status(400).json({ error: 'No se encontró el evento en Google Calendar' });

        eliminarEvento(row.google_event_id).then(() => {
            db.run('DELETE FROM citas WHERE id = ?', [id], function (err) {
                if (err) return res.status(500).json({ error: err.message });
                const mensaje = `⚠️ Hola ${row.nombre}, tu cita para *${row.servicio}* ha sido *cancelada*.\n📆 Fecha: ${row.fecha}\n🕒 Hora: ${row.hora}\nSi necesitas reprogramarla, contáctanos.`;
                enviarMensajeWhatsApp(row.telefono, mensaje);
                res.json({ message: `🗑️ Cita con ID ${id} eliminada correctamente`, google_event_id: row.google_event_id });
            });
        });
    });
};

module.exports = { getCitas, createCita, updateCita, deleteCita };

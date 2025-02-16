const db = require('../database/db');

// Obtener todas las citas
const getCitas = (req, res) => {
    db.all('SELECT * FROM citas', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// Crear una nueva cita
const createCita = (req, res) => {
    const { nombre, telefono, fecha, hora, servicio } = req.body;
    if (!nombre || !telefono || !fecha || !hora || !servicio) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const query = 'INSERT INTO citas (nombre, telefono, fecha, hora, servicio) VALUES (?, ?, ?, ?, ?)';
    db.run(query, [nombre, telefono, fecha, hora, servicio], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        const nuevaCita = { id: this.lastID, nombre, telefono, fecha, hora, servicio };

        // 🔹 Aquí agregaremos la integración con WhatsApp Business y Google Calendar en el futuro
        console.log(`📅 Nueva cita creada: ${JSON.stringify(nuevaCita)}`);

        res.json(nuevaCita);
    });
};

// Actualizar una cita
const updateCita = (req, res) => {
    const { nombre, telefono, fecha, hora, servicio } = req.body;
    const { id } = req.params;

    const query = 'UPDATE citas SET nombre = ?, telefono = ?, fecha = ?, hora = ?, servicio = ? WHERE id = ?';
    db.run(query, [nombre, telefono, fecha, hora, servicio, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        res.json({ message: `✅ Cita con ID ${id} actualizada` });
    });
};

// Eliminar una cita
const deleteCita = (req, res) => {
    const { id } = req.params;
    
    const query = 'DELETE FROM citas WHERE id = ?';
    db.run(query, [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        res.json({ message: `🗑️ Cita con ID ${id} eliminada` });
    });
};

module.exports = { getCitas, createCita, updateCita, deleteCita };

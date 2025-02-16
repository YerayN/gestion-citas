const express = require('express');
const router = express.Router();
const { getCitas, createCita, updateCita, deleteCita } = require('../controllers/appointmentController');
const db = require("../database/db");

// Definir rutas para gestionar citas
router.get('/', getCitas);
router.post('/', createCita);
router.put('/:id', updateCita);
router.delete('/:id', deleteCita);

// Nueva ruta: Obtener la lista de servicios disponibles
router.get('/servicios', (req, res) => {
    db.all("SELECT * FROM servicios", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

module.exports = router;

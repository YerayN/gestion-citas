const express = require('express');
const router = express.Router();
const db = require("../database/db");

router.get("/", (req, res) => {
    db.all("SELECT id, nombre, duracion, precio FROM servicios", [], (err, rows) => {
        if (err) {
            console.error("❌ Error al obtener servicios:", err.message);
            return res.status(500).json({ error: "Error al obtener los servicios" });
        }
        res.json(rows);
    });
});

module.exports = router;

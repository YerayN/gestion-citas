const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conectar con la base de datos SQLite
const dbPath = path.resolve(__dirname, 'citas.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error al conectar con SQLite:', err.message);
    } else {
        console.log('✅ Conectado a la base de datos SQLite');
    }
});

// Crear la tabla si no existe
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS citas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            telefono TEXT NOT NULL,
            fecha TEXT NOT NULL,
            hora TEXT NOT NULL,
            servicio TEXT NOT NULL,
            whatsapp_enviado BOOLEAN DEFAULT 0,
            google_event_id TEXT DEFAULT NULL
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error al crear la tabla:', err.message);
        } else {
            console.log('✅ Tabla "citas" verificada o creada');
        }
    });
});

module.exports = db;

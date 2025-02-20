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

// Función para ejecutar consultas SQL con manejo de errores
const runQuery = (query, params = [], successMessage) => {
    db.run(query, params, (err) => {
        if (err) {
            console.error(`❌ Error: ${err.message}`);
        } else {
            console.log(`✅ ${successMessage}`);
        }
    });
};

// Crear las tablas si no existen
db.serialize(() => {
    // Tabla de citas
    runQuery(`
        CREATE TABLE IF NOT EXISTS citas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            telefono TEXT NOT NULL,
            fecha TEXT NOT NULL,
            hora TEXT NOT NULL,
            hora_fin TEXT NOT NULL,
            servicio TEXT NOT NULL,
            whatsapp_enviado BOOLEAN DEFAULT 0,
            google_event_id TEXT DEFAULT NULL
        )
    `, [], 'Tabla "citas" verificada o creada');

    // Tabla de pagos
    runQuery(`
        CREATE TABLE IF NOT EXISTS pagos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente TEXT NOT NULL,
            fecha TEXT NOT NULL,
            hora TEXT NOT NULL,
            servicio TEXT NOT NULL,
            cantidad REAL NOT NULL,
            metodo TEXT CHECK(metodo IN ('Efectivo', 'Tarjeta')) NOT NULL
        )
    `, [], 'Tabla "pagos" verificada o creada');

    // Tabla de servicios
    runQuery(`
        CREATE TABLE IF NOT EXISTS servicios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL UNIQUE,
            duracion INTEGER NOT NULL,
            precio REAL DEFAULT 0
        )
    `, [], 'Tabla "servicios" verificada o creada');

    // Verificar si la columna "precio" existe en la tabla servicios
    db.all(`PRAGMA table_info(servicios)`, (err, rows) => {
        if (err) {
            console.error('❌ Error al verificar la tabla "servicios":', err.message);
            return;
        }

        if (Array.isArray(rows)) {
            const columnaPrecioExiste = rows.some(row => row.name === "precio");
            if (!columnaPrecioExiste) {
                runQuery(`ALTER TABLE servicios ADD COLUMN precio REAL DEFAULT 0`, [], 'Columna "precio" añadida a "servicios"');
            } else {
                console.log('✅ La columna "precio" ya existe en "servicios"');
            }
        } else {
            console.error('❌ Error: PRAGMA table_info no devolvió un array');
        }
    });

    // Insertar servicios por defecto si la tabla está vacía
    db.get("SELECT COUNT(*) AS count FROM servicios", [], (err, row) => {
        if (err) {
            console.error("❌ Error al verificar los servicios:", err.message);
            return;
        }

        if (row.count === 0) {
            runQuery(`
                INSERT INTO servicios (nombre, duracion, precio) VALUES
                ('Corte de pelo', 30, 16.00),
                ('Barba', 30, 5.00),
                ('Corte de pelo y barba', 60, 21.00)
            `, [], '✅ Servicios por defecto insertados');
        }
    });

});

module.exports = db;

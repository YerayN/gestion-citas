const cron = require('node-cron');
const db = require('../database/db');
const { enviarMensajeWhatsApp } = require('./whatsappService');

// 🕒 Programar un recordatorio diario a las 9:00 AM
cron.schedule('0 9 * * *', () => {
    console.log('📅 Ejecutando tarea de recordatorios...');

    // Obtener citas programadas para el día siguiente
    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    const fechaMañana = mañana.toISOString().split('T')[0];

    db.all('SELECT nombre, telefono, fecha, hora, servicio FROM citas WHERE fecha = ?', [fechaMañana], (err, citas) => {
        if (err) {
            console.error('❌ Error obteniendo citas:', err.message);
            return;
        }

        citas.forEach((cita) => {
            const mensaje = `⏳ Hola ${cita.nombre}, este es un recordatorio de tu cita.\n📆 Fecha: ${cita.fecha}\n🕒 Hora: ${cita.hora}\n📌 Servicio: ${cita.servicio}\n¡Te esperamos!`;
            enviarMensajeWhatsApp(cita.telefono, mensaje);
        });

        console.log(`📨 Se enviaron ${citas.length} recordatorios.`);
    });
}, {
    timezone: "Europe/Madrid" // Ajusta a tu zona horaria
});

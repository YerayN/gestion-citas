const fs = require('fs');
const { google } = require('googleapis');

// Cargar las credenciales y el token
const credentials = JSON.parse(fs.readFileSync('credentials.json'));
const token = JSON.parse(fs.readFileSync('token.json'));

const { client_id, client_secret, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
oAuth2Client.setCredentials(token);

// Crear instancia de Google Calendar
const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

/**
 * Crear un evento en Google Calendar
 * @param {Object} cita - Datos de la cita (nombre, teléfono, fecha, hora, servicio)
 * @returns {Promise<string>} - ID del evento en Google Calendar
 */
const crearEvento = async (cita) => {
    try {
        const startDateTime = `${cita.fecha}T${cita.hora}:00`;
        const endHour = String(parseInt(cita.hora.split(':')[0]) + 1).padStart(2, '0'); // Asegurar dos dígitos
        const endDateTime = `${cita.fecha}T${endHour}:${cita.hora.split(':')[1]}:00`;

        const evento = {
            summary: `Cita: ${cita.servicio} con ${cita.nombre}`,
            description: `Cliente: ${cita.nombre}\nTeléfono: ${cita.telefono}`,
            start: {
                dateTime: startDateTime,
                timeZone: 'Europe/Madrid',
            },
            end: {
                dateTime: endDateTime,
                timeZone: 'Europe/Madrid',
            },
        };

        console.log('📅 Enviando evento a Google Calendar:', JSON.stringify(evento, null, 2));

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: evento,
        });

        console.log(`✅ Evento creado en Google Calendar: ${response.data.htmlLink}`);
        return response.data.id;
    } catch (error) {
        console.error('❌ Error al crear el evento en Google Calendar:', error);
        console.error('🔍 Respuesta de Google:', error.response?.data || error.message);
        throw new Error('No se pudo crear el evento en Google Calendar');
    }
};

/**
 * Actualizar un evento en Google Calendar
 * @param {string} eventId - ID del evento en Google Calendar
 * @param {Object} cita - Datos actualizados de la cita
 * @returns {Promise<void>}
 */
const actualizarEvento = async (eventId, cita) => {
    try {
        const startDateTime = `${cita.fecha}T${cita.hora}:00`;
        const endHour = String(parseInt(cita.hora.split(':')[0]) + 1).padStart(2, '0');
        const endDateTime = `${cita.fecha}T${endHour}:${cita.hora.split(':')[1]}:00`;

        const eventoActualizado = {
            summary: `Cita: ${cita.servicio} con ${cita.nombre}`,
            description: `Cliente: ${cita.nombre}\nTeléfono: ${cita.telefono}`,
            start: {
                dateTime: startDateTime,
                timeZone: 'Europe/Madrid',
            },
            end: {
                dateTime: endDateTime,
                timeZone: 'Europe/Madrid',
            },
        };

        console.log(`🔄 Actualizando evento en Google Calendar: ${eventId}`);

        await calendar.events.update({
            calendarId: 'primary',
            eventId: eventId,
            resource: eventoActualizado,
        });

        console.log(`✅ Evento actualizado en Google Calendar: ${eventId}`);
    } catch (error) {
        console.error('❌ Error al actualizar el evento en Google Calendar:', error.response?.data || error.message);
    }
};

/**
 * Eliminar un evento en Google Calendar
 * @param {string} eventId - ID del evento en Google Calendar
 * @returns {Promise<void>}
 */
const eliminarEvento = async (eventId) => {
    try {
        console.log(`🗑️ Eliminando evento en Google Calendar: ${eventId}`);

        await calendar.events.delete({
            calendarId: 'primary',
            eventId: eventId,
        });

        console.log(`✅ Evento eliminado de Google Calendar: ${eventId}`);
    } catch (error) {
        console.error('❌ Error al eliminar el evento en Google Calendar:', error.response?.data || error.message);
    }
};

module.exports = { crearEvento, actualizarEvento, eliminarEvento };
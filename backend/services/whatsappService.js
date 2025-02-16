const twilio = require('twilio');
require('dotenv').config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Enviar un mensaje de WhatsApp al cliente
 * @param {string} numeroCliente - Número de teléfono del cliente (con código de país)
 * @param {string} mensaje - Mensaje a enviar
 */
const enviarMensajeWhatsApp = async (numeroCliente, mensaje) => {
    try {
        const response = await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:+${numeroCliente}`, // Asegurar formato internacional
            body: mensaje,
        });

        console.log(`📨 Mensaje enviado a ${numeroCliente}: ${response.sid}`);
    } catch (error) {
        console.error('❌ Error al enviar mensaje de WhatsApp:', error.message);
    }
};

module.exports = { enviarMensajeWhatsApp };

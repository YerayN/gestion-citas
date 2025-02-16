const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// Cargar las credenciales desde el archivo JSON
const credentials = JSON.parse(fs.readFileSync('credentials.json'));
const { client_id, client_secret, redirect_uris } = credentials.installed;

// Crear un cliente OAuth2
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Definir los permisos necesarios
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// Generar el enlace de autenticación
console.log('🔗 Visita este enlace para autorizar la aplicación:');
console.log(oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES }));

// Solicitar el código de autorización en la terminal
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('🔑 Introduce el código de autorización: ', (code) => {
    oAuth2Client.getToken(code, (err, token) => {
        if (err) {
            console.error('❌ Error al obtener el token', err);
            return;
        }
        fs.writeFileSync('token.json', JSON.stringify(token));
        console.log('✅ Token guardado correctamente en token.json');
        rl.close();
    });
});

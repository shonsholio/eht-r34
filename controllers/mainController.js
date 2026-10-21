const controller = {}

import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

    // Configurar autenticación con la Service Account
  
let authOptions = {
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
};

if (process.env.GOOGLE_CREDENTIALS) {
  // En Vercel: parseamos el string JSON guardado en las Environment Variables
  authOptions.credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
} else {
  // En local: lee el archivo credentials.json de la raíz del proyecto
  authOptions.keyFile = './credentials.json';
}

const auth = new google.auth.GoogleAuth(authOptions);

// const auth = new google.auth.GoogleAuth({
//   keyFile: path.join(__dirname, '../credentials.json'), // Ruta a tus credenciales JSON
//   scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
// });

const SPREADSHEET_ID = '1-Nd_EtVn6fSFXQDIOemYmrjWKt2_hZLKq2Z21HQYgjA';

controller.inicio = async function (req,res) {


// Función para obtener los datos de una hoja específica o rango
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Reemplaza 'NombreDeLaHoja!A1:Z100' por la pestaña/rango correspondiente
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Itinerario!A1:L50', // O el nombre exacto de la pestaña
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron datos.' });
    }

    // Convertir la primera fila (encabezados) en llaves de objeto
    const headers = rows[0];
    const formattedData = rows.slice(1).map(row => {
      let rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index] || '';
      });
      return rowData;
    });

    // Si usas un motor de plantilla (EJS / Pug / Handlebars):
    // return res.render('vista', { data: formattedData });

    // Si entregas un Endpoint API para consumir con Fetch desde Frontend:
    // return res.json(formattedData);
    return res.render('inicio', 
      { data: formattedData }
    );


  } catch (error) {
    console.error('Error al obtener datos de Google Sheets:', error);
    res.status(500).send('Error del servidor');
  }


}




export { controller }
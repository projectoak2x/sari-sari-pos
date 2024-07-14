import { google } from 'googleapis';
import moment from 'moment';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Initialize the Google Sheets API client
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const sheets = google.sheets({ version: 'v4', auth });
      const spreadsheetId = '1LNdFrIRCG1iCXI45LRR9zJJW5q0mcg72hCdra6TPkGk';
      
      const now = moment();

      const resourcePayload = [];
      req.body.forEach(element => {
        resourcePayload.push([
            now.format('YYYY-MM-DD HH:mm'),
            element.itemId,
            element.itemName,
            element.itemCount,
            element.itemPrice,
            req.query.status === true ? 'unpaid' : 'paid',
            req.query.customer
        ])
      });

      // Append data to the sheet
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: req.query.status?'Unpaid':'Transaction', // Change as per your sheet's name
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: resourcePayload, 
        },
      });

      res.status(200).json({ success: true, data: response.data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

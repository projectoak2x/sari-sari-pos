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
        scopes: ['https://www.googleapis.com/auth/script.external_request'],
      });
      console.log(auth)
      const script = await google.script({ version: 'v1', auth });
      const scriptId = 'AKfycbw3dMbaDRvFUpXFbhHruy2cZCnWBM-IIrEUWRZjGvKliBT6-QFSz1PAt4pc7is-w-KG4A'
      
      // Prepare your payload
      // ...
      // Call the Apps Script
      const response = await script.scripts.run({
        scriptId,
        resource: {
          function: 'testMe',
        },
      });

      res.status(200).json({ success: true, data: response.data });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

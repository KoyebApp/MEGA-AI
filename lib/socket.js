import path from 'path';
import { writeFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function SaveCreds(txt) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Get Base64 data from .env
  const base64Data = process.env.SESSION_ID;

  if (!base64Data) {
    console.error('No Base64 credentials found in .env file.');
    return;
  }

  try {
    // Decode Base64 data
    const decodedData = Buffer.from(base64Data, 'base64').toString('utf-8');

    // Save decoded data to creds.json
    const credsPath = path.join(__dirname, '..', 'session', 'creds.json');
    writeFileSync(credsPath, decodedData);
    console.log('Saved credentials to', credsPath);
  } catch (error) {
    console.error('Error decoding or saving credentials:', error);
  }
}

export default SaveCreds;

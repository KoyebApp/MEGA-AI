import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const base64Data = process.env.WHATSAPP_CREDS_BASE64;

if (!base64Data) {
  console.error('No Base64 credentials found in .env file.');
  process.exit(1);
}

try {
  // Decode Base64 data
  const decodedData = Buffer.from(base64Data, 'base64').toString('utf-8');

  // Parse the decoded data as JSON
  const credentials = JSON.parse(decodedData);

  // Save decoded data to creds.json
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const credsPath = path.join(__dirname, '..', 'session', 'creds.json');
  writeFileSync(credsPath, JSON.stringify(credentials, null, 2));

  console.log('Credentials saved to:', credsPath);
} catch (error) {
  console.error('Error decoding or saving credentials:', error);
}

import { fileURLToPath } from 'url';
import path from 'path';
import { writeFileSync } from 'fs';
import axios from 'axios'; // We will use axios to fetch raw Pastebin data

async function SaveCreds(txt) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const PasteId = txt.replace('Some-Custom-Words_', '');

  // The 'txt' parameter should contain the Pastebin raw URL or the Pastebin code
  const pastebinUrl = `https://pastebin.com/raw/${PasteId}`;  // Construct raw Pastebin URL
  console.log(`PASTE URL: ${pastebinUrl}`);

  try {
    // Fetch the raw data from Pastebin
    const response = await axios.get(pastebinUrl);

    // Ensure the data is a string or Buffer
    const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

    // Define the path to save the creds.json file in the session folder
    const credsPath = path.join(__dirname, '..', 'session', 'creds.json');
    
    // Write the fetched data to creds.json
    writeFileSync(credsPath, data);
    console.log('Saved credentials to', credsPath);
    
  } catch (error) {
    console.error('Error downloading or saving credentials:', error);
  }
}

export default SaveCreds;

import fetch from 'node-fetch'
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'

/**
 * Upload file buffer to PixelDrain
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
export default async buffer => {
  console.log('[🔍] Detecting file type...');
  const { ext, mime } = await fileTypeFromBuffer(buffer);
  if (!ext || !mime) throw '❌ Could not determine file type.';
  console.log(`[✅] File type: ${ext} (${mime})`);

  const blob = new Blob([buffer.toArrayBuffer()], { type: mime });
  const form = new FormData();
  form.append('file', blob, `file.${ext}`);

  console.log('[⏫] Uploading to PixelDrain...');
  const res = await fetch('https://pixeldrain.com/api/file', {
    method: 'POST',
    body: form,
    headers: {
      Authorization: 'Basic ' + Buffer.from(':95097075-0440-4591-acc2-742d>
    }
  });

  const json = await res.json();
  console.log('[📥] Response:', json);

  if (!json.success) throw `❌ Upload failed: ${json.message || 'Unknown e>

  const url = `https://pixeldrain.com/u/${json.id}`;
  console.log(`[✅] Uploaded: ${url}`);
  return url;
}

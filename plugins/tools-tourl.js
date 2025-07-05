import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import axios from 'axios'
import FormData from 'form-data'
import { fileTypeFromBuffer } from 'file-type'

let handler = async m => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!mime) throw '✳️ Respond to an image, video, sticker, or audio'

  let mediaBuffer = await q.download()

  if (mediaBuffer.length > 10 * 1024 * 1024) {
    throw '✴️ Media size exceeds 10 MB. Please upload a smaller file.'
  }

  try {
    // ✅ Correct: Use fileTypeFromBuffer instead of fromBuffer
    const fileType = await fileTypeFromBuffer(mediaBuffer)
    if (!fileType?.ext) throw '❌ Could not determine file type.'

    // Prepare form data for Uguu.se
    const form = new FormData()
    form.append('files[]', mediaBuffer, { filename: `file.${fileType.ext}` })

    const uploadRes = await axios.post('https://uguu.se/upload.php', form, {
      headers: {
        ...form.getHeaders()
      }
    })

    console.log('[Uguu Upload Response]', uploadRes.data)

    const url = uploadRes?.data?.files?.[0]?.url
    if (!url) throw 'Upload failed: Invalid response'

    const fileSizeMB = (mediaBuffer.length / (1024 * 1024)).toFixed(2)
    m.reply(`✅ *Upload Successful!*\n📎 *URL:* ${url}\n💾 *Size:* ${fileSizeMB} MB`)

  } catch (e) {
    console.error('[Upload Error]', e)
    m.reply(`❌ Upload failed: ${e.message || e}`)
  }
}

handler.help = ['tourl']
handler.tags = ['tools']
handler.command = ['url', 'tourl']

export default handler

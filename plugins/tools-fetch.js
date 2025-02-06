import fetch from 'node-fetch'
import { format } from 'util'

let handler = async (m, { text, conn }) => {
    if (!/^https?:\/\//.test(text)) throw `✳️ ${mssg.noLink('http:// o https://')}`

    // Parse the URL from the input text
    let _url = new URL(text)

    // Get the full API URL using global.API
    let url = global.API(_url.origin, _url.pathname, Object.fromEntries(_url.searchParams.entries()), 'APIKEY')

    // Log the API URL and the API key used
    console.log("API URL:", url)
    console.log("API Key:", 'APIKEY')  // Replace with actual API key variable if needed

    // Fetch the response from the API
    let res = await fetch(url)

    // Check content-length to prevent large files from being processed
    if (res.headers.get('content-length') > 100 * 1024 * 1024 * 1024) {
        throw `Content-Length: ${res.headers.get('content-length')}`
    }

    // If response is not text or json, send the file
    if (!/text|json/.test(res.headers.get('content-type'))) {
        return conn.sendFile(m.chat, url, 'file', text, m)
    }

    // Get the response buffer and try to parse it
    let txt = await res.buffer()

    try {
        // Attempt to parse as JSON
        txt = format(JSON.parse(txt + ''))
    } catch (e) {
        // If parsing fails, treat it as text
        txt = txt + ''
    } finally {
        // Send the result to the user, truncated to 65536 characters
        m.reply(txt.slice(0, 65536) + '')
    }
}

handler.help = ['get']
handler.tags = ['tools']
handler.command = /^(fetch|gets)$/i

export default handler

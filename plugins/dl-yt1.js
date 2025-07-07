import fetch from 'node-fetch';

const fetchWithRetry = async (url, options = {}, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);
    if (res.ok) return res;
    console.log(`Retrying... (${i + 1})`);
  }
  throw new Error('❌ Failed to fetch audio after retries.');
};

const handler = async (m, { args, conn }) => {
  if (!args.length) return m.reply('❌ Please provide a YouTube URL.');

  const url = args.join(' ');
  const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  if (!ytRegex.test(url)) {
    await m.react('❌');
    return m.reply('❌ Invalid YouTube URL.');
  }

  await m.react('⏳');

  try {
    const api = `https://ytdlp.giftedtech.web.id/api/audio.php?url=${encodeURIComponent(url)}`;
    const { result } = await fetch(api).then(res => res.json());

    if (!result?.stream_url) throw new Error('🔁 Could not get a valid audio stream. Try again later.');

    const { stream_url, title, thumbnail } = result;
    const caption = `🎵 *${title || 'YouTube Audio'}*\n\n📥 *Powered by MEGA-AI*`;

    const mediaRes = await fetchWithRetry(stream_url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const buffer = Buffer.from(await mediaRes.arrayBuffer());
    if (!buffer.length) throw new Error('⚠️ Downloaded audio is empty.');

    // Optionally send thumbnail with caption
    if (thumbnail && /\.(jpg|jpeg|png|webp)$/.test(thumbnail)) {
      await conn.sendMessage(m.chat, {
        image: { url: thumbnail },
        caption: caption
      }, { quoted: m });
    }

    // Send the MP3 audio
    await conn.sendFile(m.chat, buffer, 'yt_audio.mp3', caption, m, false, {
      mimetype: 'audio/mpeg'
    });

    await m.react('✅');
  } catch (err) {
    console.error('YTMP3 Error:', err);
    await m.reply(`❌ Error: ${err.message}`);
    await m.react('❌');
  }
};

handler.help = ['ytmp3 <url>', 'yta <url>'];
handler.tags = ['dl'];
handler.command = ['ytmp3', 'yta'];
handler.limit = true;

export default handler;

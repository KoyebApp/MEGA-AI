import fetch from 'node-fetch';

const fetchWithTimeoutRetry = async (url, options = {}, retries = 3, timeout = 30000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timer);

      if (res.ok) return res;
      console.log(`Retry ${i + 1} failed with status ${res.status}`);
    } catch (err) {
      console.log(`Retry ${i + 1} error: ${err.name} - ${err.message}`);
    }
  }
  throw new Error('❌ Failed to fetch media content after retries.');
};

const handler = async (m, { args, conn }) => {
  if (!args.length) return m.reply('❌ Please provide a YouTube URL.');

  const url = args.join(' ');
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  if (!youtubeRegex.test(url)) {
    await m.react('❌');
    return m.reply('⚠️ Invalid YouTube URL. Please provide a valid one.');
  }

  await m.react('⏳');

  try {
    const api = `https://ytdlp.giftedtech.web.id/api/video.php?url=${encodeURIComponent(url)}&format=360`;
    const res = await fetch(api);
    const json = await res.json();

    console.log('[🔍 API RESPONSE]:', JSON.stringify(json, null, 2));

    if (!json.success) {
      const errorMsg = json.error?.includes('Requested format is not available')
        ? '❌ Requested format is not available.\n👉 Try another video.'
        : `❌ API Error: ${json.error || 'Unknown error'}`;
      throw new Error(errorMsg);
    }

    if (!json.result?.stream_url) {
      throw new Error('❌ Video stream URL not found. Try a different link.');
    }

    const {
      title = 'Unknown Title',
      thumbnail,
      stream_url,
      format = '360p',
      src_url = url,
      info = ''
    } = json.result;

    const caption = `*🔽 MEGA-AI YT DOWNLOADER*\n\n` +
      `🎬 *Title:* ${title}\n` +
      `📺 *Quality:* ${format}\n` +
      `🔗 *Source:* ${src_url}\n` +
      `ℹ️ *Info:* ${info}\n\n` +
      `🔧 *Powered by:* MEGA-AI`;

    const mediaRes = await fetchWithTimeoutRetry(stream_url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': '*/*'
      }
    }, 3, 30000);

    const contentType = mediaRes.headers.get('content-type') || '';
    if (!contentType.includes('video'))
      throw new Error(`❌ Invalid content-type: ${contentType}`);

    const arrayBuffer = await mediaRes.arrayBuffer();
    const mediaBuffer = Buffer.from(arrayBuffer);

    if (!mediaBuffer.length) throw new Error('❌ Downloaded video is empty.');

    await conn.sendFile(m.chat, mediaBuffer, `ytvideo.mp4`, caption, m, false, {
      mimetype: 'video/mp4',
      thumbnail
    });

    await m.react('✅');
  } catch (err) {
    console.error('[❌ YTMP4 ERROR]', err.message);
    await m.reply(err.message);
    await m.react('❌');
  }
};

handler.help = ['ytmp4 <url>'];
handler.tags = ['dl'];
handler.command = ['ytmp4', 'ytv'];
handler.limit = true;

export default handler;

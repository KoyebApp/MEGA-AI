import fetch from 'node-fetch';

const fetchWithRetry = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, options);
    if (response.ok) return response;
    console.log(`Retrying... (${i + 1})`);
  }
  throw new Error('Failed to fetch media content after retries');
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
    const api = `https://ytdlp.giftedtech.web.id/api/video.php?url=${encodeURIComponent(url)}`;
    const response = await fetch(api);
    const json = await response.json();

    if (!json.success || !json.result || !json.result.stream_url) {
      throw new Error('Video data is incomplete or unavailable.');
    }

    const {
      title,
      thumbnail,
      stream_url,
      format,
      src_url,
      info
    } = json.result;

    const caption = `*🔽 MEGA-AI YT DOWNLOADER*\n\n` +
      `🎬 *Title:* ${title}\n` +
      `📺 *Quality:* ${format}\n` +
      `🔗 *Source:* ${src_url}\n` +
      `ℹ️ *Info:* ${info}\n\n` +
      `🔧 *Powered by:* MEGA-AI`;

    const mediaResponse = await fetchWithRetry(stream_url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': '*/*'
      }
    });

    const contentType = mediaResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('video'))
      throw new Error('Invalid video content type');

    const arrayBuffer = await mediaResponse.arrayBuffer();
    const mediaBuffer = Buffer.from(arrayBuffer);
    if (mediaBuffer.length === 0) throw new Error('Downloaded video is empty');

    await conn.sendFile(m.chat, mediaBuffer, `ytvideo.mp4`, caption, m, false, {
      mimetype: 'video/mp4',
      thumbnail: thumbnail
    });

    await m.react('✅');
  } catch (err) {
    console.error('YT Error:', err.message);
    await m.reply('❌ Failed to download video. Please try another link or try again later.');
    await m.react('❌');
  }
};

handler.help = ['ytmp4 <url>'];
handler.tags = ['dl'];
handler.command = ['ytmp4', 'ytv'];
handler.limit = true;

export default handler;

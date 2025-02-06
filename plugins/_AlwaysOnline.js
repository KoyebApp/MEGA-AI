export async function before(m) {
  const chat = global.db.data.chats[m.chat];
  if (!chat.autotype) return;

  // Toggle "always online" state
  if (m.text === '!online on') {
    global.db.data.settings.Online = true;
    await m.reply('Always online is now ON.');
    return;
  } else if (m.text === '!online off') {
    global.db.data.settings.Online = false;
    await m.reply('Always online is now OFF.');
    return;
  }

  // Check if "always online" is enabled
  if (!global.db.data.settings.Online) return;

  const commands = Object.values(global.plugins).flatMap(plugin => [].concat(plugin.command));
  const presenceStatus = commands.some(cmd =>
    cmd instanceof RegExp ? cmd.test(m.text) : m.text.includes(cmd)
  )
    ? 'composing'
    : 'available';

  if (presenceStatus) await this.sendPresenceUpdate(presenceStatus, m.chat);
}

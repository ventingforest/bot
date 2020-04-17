import Client from '../Client';
import Channels from '../constants/Channels';

export default (tvf: Client) => {
  // load constant functions
  const channels = Channels(tvf.server);
  tvf.channels = channels;

  // set the bot's activity
  tvf.bot.user.setActivity('over you cuties <3', { type: 'WATCHING' });
  tvf.logger.info('TVF Bot is ready.');
};

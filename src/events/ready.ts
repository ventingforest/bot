import Client from '../Client';
import Channels from '../constants/Channels';
import Roles from '../constants/Roles';

export default (tvf: Client) => {
  // load constant functions
  tvf.channels = Channels(tvf.server);
  tvf.roles = Roles(tvf.server);

  // set the bot's activity
  tvf.bot.user.setActivity('over you cuties <3', { type: 'WATCHING' });
  tvf.logger.info('TVF Bot is ready.');
};

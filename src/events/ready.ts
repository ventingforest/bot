import Client from '../Client';
import Constants from '../Constants';

export default (tvf: Client) => {
  // @ts-ignore
  tvf.const = Constants(tvf.server);

  // set the bot's activity
  tvf.user.setActivity('over you cuties <3', { type: 'WATCHING' });
  tvf.logger.info('TVF Bot is ready.');
};

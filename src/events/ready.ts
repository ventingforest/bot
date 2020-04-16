import Client from '../Client';

export default (tvf: Client) => {
  // set the bot's activity
  tvf.bot.user.setActivity('over you cuties <3', { type: 'WATCHING' });
  tvf.logger.info('TVF Bot is ready.');
};

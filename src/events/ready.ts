import Client from '../Client';
import Constants from '../Constants';
import schedule from 'node-schedule';

export default (tvf: Client) => {
  // @ts-ignore
  tvf.const = Constants(tvf.server);

  // set the bot's activity
  tvf.user.setActivity('over you cuties <3', { type: 'WATCHING' });
  tvf.logger.info('TVF Bot is ready.');

  // daily role income
  schedule.scheduleJob({ hour: 0, minute: 0 }, () => {
    tvf.server.members.cache.forEach(async m => {
      const doc = await tvf.userDoc(m.id);
      await tvf.updateBalance(m.id, { bank: doc.level * 50 });
    });
  });
};

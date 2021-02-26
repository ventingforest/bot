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
  if (tvf.isProduction) {
    schedule.scheduleJob({ hour: 0, minute: 0 }, () => {
      tvf.const.channels.staff.hooters.send('Handing out role incomes!');

      tvf.server.members.cache.array().forEach(async (m, i) => {
        setTimeout(async () => {
          const doc = await tvf.userDoc(m.id);
          await tvf.updateBalance(m.id, { cash: 0, bank: doc.level * 50, reason: 'Role income!' });
          tvf.logger.info(`Increased ${m.user.tag} (Level ${doc.level})'s balance by ${doc.level * 50}!`);
        }, i * 750);
      });
    });
  }
};

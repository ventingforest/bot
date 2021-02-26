export default {
    name: 'togglelevel',
    description: 'Toggles the bot banner.',
    aliases: ['botbanner'],
    allowGeneral: true,
    staffAccess: ['Admin'],
    run: async (tvf, msg) => {
      // toggle the levelling system
      tvf.config.levelling = !tvf.config.levelling;
  
      // inform the user of the change
      if (tvf.config.levelling) {
        msg.channel.send(tvf.emojiMessage(tvf.const.emojis.confetti, 'Levelling has been enabled!'));
      } else {
        msg.channel.send(tvf.emojiMessage(tvf.const.emojis.confetti, 'Levelling has been disabled!'));
      }
    }
  } as Command;
  
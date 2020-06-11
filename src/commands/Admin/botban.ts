export default {
  name: 'botban',
  description: 'Toggles the bot banner.',
  aliases: ['botbanner'],
  run: async (tvf, msg) => {
    // toggle the bot banner
    tvf.config.botbanner = !tvf.config.botbanner;

    // inform the user of the change
    if (tvf.config.botbanner) {
      msg.channel.send(`**${tvf.emojis.confetti}  |**  You have enabled the bot banner!`);
    } else {
      msg.channel.send(`**${tvf.emojis.confetti}  |**  You have disabled the bot banner!`);
    }
  }
} as Command;

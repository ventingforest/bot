export default {
  name: 'compliment',
  description: 'Compliment another user in the server!',
  module: 'Fun',
  args: true,
  usage: 'compliment <@user>',
  examples: ['compliment @newt#1234'],
  run: async (tvf, msg, args) => {
    // find the mentioned member
    const member = tvf.checkForMember(msg, args).user;

    // make the embed
    const compliment = tvf.compliments[Math.floor(Math.random() * tvf.compliments.length)];
    const embed = tvf.createEmbed({ thumbnail: false })
      .setAuthor(msg.author.tag, msg.author.avatarURL())
      .setTitle(`${member.username}, ${compliment}`)
      .setThumbnail(member.avatarURL())

    msg.channel.send(embed);

    // if the mentioned user was the bot
    if (member === tvf.bot.user) msg.reply('aww, thank you <3');
  }
} as Command;

export default {
  name: 'kiss',
  description: 'Kiss another user in the server.',
  module: 'Fun',
  args: true,
  usage: 'kiss <@user>',
  examples: ['kiss @newt#1234'],
  run: async (tvf, msg, args) => {
    // find the mentioned member
    const member = tvf.checkForMember(msg, args).user;

    // create the embed
    const embed = tvf.createEmbed({ thumbnail: false })
      .setAuthor(msg.author.tag, msg.author.avatarURL())
      .setThumbnail(member.avatarURL())
      .setImage((await tvf.randomImage('kiss')).url);

    // if the mentioned user was the author
    if (member === msg.author) {
      return msg.channel.send(embed.setTitle(`${msg.author.username} kissed themselves? ${tvf.emojis.think}`));
    }

    // if the user mentioned is the bot
    if (member === tvf.bot.user) {
      return msg.channel.send(tvf.emojis.flushed);
    }

    msg.channel.send(embed.setTitle(`${msg.author.username} kissed ${member.username} ${tvf.emojis.hearts.revolving}`));
  }
} as Command;

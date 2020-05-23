export default {
  name: 'kiss',
  description: 'Kiss another user in the server.',
  args: true,
  usage: '<@user>',
  run: async (tvf, msg, args) => {
    // find the mentioned member
    const member = tvf.checkForMember(msg, args).user;

    // ensure that the user is comfortable with PDA
    const doc = await tvf.userDoc(member.id);

    if (doc.pda) {
      // create the embed
      const embed = tvf.createEmbed({ thumbnail: false, author: true }, msg)
        .setThumbnail(member.avatarURL())
        .setImage((await tvf.randomImage('kiss')).url);

        // if the mentioned user was the author
        if (member === msg.author) {
          return msg.channel.send(embed.setTitle(`${msg.author.username}... kissed themselves? ${tvf.emojis.think}`));
        }

        // if the user mentioned is the bot
        if (member === tvf.bot.user) {
          return msg.channel.send(tvf.emojis.flushed);
        }

        msg.channel.send(embed.setTitle(`${msg.author.username} kissed ${member.username} ${tvf.emojis.hearts.revolving}`));
    } else {
      await msg.delete();
      return msg.author.send(`**${tvf.emojis.cross}  |**  ${member.username} has opted out of PDA - so you can not use this command on them. Sorry!`)
    }
  }
} as Command;

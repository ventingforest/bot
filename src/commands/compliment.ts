export default {
  name: 'compliment',
  description: 'Compliment another user in the server!',
  module: 'Fun',
  args: true,
  usage: '<@user>',
  run: async (tvf, msg, args) => {
    // find the mentioned member
    const member = tvf.checkForMember(msg, args).user;

    // ensure that the user is comfortable with PDA
    const doc = await tvf.userDoc(member.id);

    if (doc.pda) {
      // make the embed
      const compliment = tvf.compliments[Math.floor(Math.random() * tvf.compliments.length)];
      const embed = tvf.createEmbed({ thumbnail: false })
        .setAuthor(msg.author.tag, msg.author.avatarURL())
        .setTitle(`${member.username}, ${compliment}`)
        .setThumbnail(member.avatarURL())

      msg.channel.send(embed);

      // if the mentioned user was the bot
      if (member === tvf.bot.user) msg.reply('aww, thank you <3');
    } else {
      await msg.delete();
      return msg.author.send(`**${tvf.emojis.cross}  |**  ${member.username} has opted out of PDA - so you can not use this command on them. Sorry!`)
    }
  }
} as Command;

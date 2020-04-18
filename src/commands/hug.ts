export default {
  name: 'hug',
  description: 'Hug another user in the server',
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
      const embed = tvf.createEmbed({ thumbnail: false })
        .setAuthor(msg.author.tag, msg.author.avatarURL())
        .setThumbnail(member.avatarURL())
        .setImage((await tvf.randomImage('hug')).url);

      // if the mentioned user was the author
      if (member === msg.author) return msg.channel.send(embed.setTitle(`${msg.author.username} hugged themselves ${tvf.emojis.hug}`));

      // if the mentioned user was the bot
      if (member === tvf.bot.user) return msg.channel.send(embed.setTitle(`${msg.author.username} hugged me ${tvf.emojis.hug}`));

      msg.channel.send(embed.setTitle(`${msg.author.username} hugged ${member.username} ${tvf.emojis.hug}`));
    } else {
      await msg.delete();
      return msg.author.send(`**${tvf.emojis.cross}  |**  ${member.username} has opted out of PDA - so you can not use this command on them. Sorry!`)
    }
  }
} as Command;

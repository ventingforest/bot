import ms from 'ms';

export default {
  name: 'about',
  description: 'Information about the bot and the server!',
  aliases: ['stats', 'serverinfo', 'botinfo'],
  run: async (tvf, msg) => {
    const developer = tvf.const.staffRoles.hackerbeing.members.first().user;
    const members = await tvf.server.members.fetch();
    const channels = tvf.server.channels.cache;

    const embed = tvf.createEmbed()
      .setAuthor(developer.tag, developer.avatarURL())
      .addFields([
        {
          name: 'Uptime',
          value: ms(tvf.bot.uptime, { long: true }),
          inline: true,
        },
        {
          name: 'Members',
          value: members.size,
          inline: true,
        },
        {
          name: 'Users',
          value: members.filter(m => !m.user.bot).size,
          inline: true,
        },
        {
          name: 'Bots',
          value: members.filter(m => m.user.bot).size,
          inline: true,
        },
        {
          name: 'Channels',
          value: channels.filter(c => c.type !== 'category').size,
          inline: true,
        },
        {
          name: 'Text',
          value: channels.filter(c => c.type === 'text').size,
          inline: true,
        },
        {
          name: 'Voice',
          value: channels.filter(c => c.type === 'voice').size,
          inline: true,
        }
      ])
      .setFooter(`Made with ❤ and Discord.js by ${developer.tag}`, tvf.bot.user.avatarURL());

      return msg.channel.send(embed);
  }
} as Command;

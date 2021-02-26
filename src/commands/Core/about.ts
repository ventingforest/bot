import ms from 'ms';
import si from 'systeminformation';
import bytes from 'pretty-bytes';
import pkg from '../../../package.json';

export default {
  name: 'about',
  description: 'Information about the bot and the server!',
  aliases: ['stats', 'serverinfo', 'botinfo'],
  run: async (tvf, msg) => {
    const developer = tvf.const.roles.staff.hackerbeing.members.first().user;
    const members = await tvf.server.members.fetch();
    const channels = tvf.server.channels.cache;
    const cpu = await si.currentLoad();

    const embed = tvf.createEmbed()
      .setAuthor(developer.tag, developer.avatarURL())
      .addFields([
        {
          name: 'Uptime',
          value: ms(tvf.uptime, { long: true }),
          inline: true,
        },
        {
          name: 'Members',
          value: members.size,
          inline: true,
        },
        {
          name: 'Online',
          value: members.filter(g => g.user.presence.status === 'online').size,
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
        },
        {
          name: 'RAM Used',
          value: bytes(process.memoryUsage().heapTotal),
          inline: true,
        },
        {
          name: 'CPU Usage',
          value: `${Math.round(cpu.currentload)}%`,
          inline: true,
        },
        {
          name: 'Discord.js Version',
          value: pkg.dependencies['discord.js'],
          inline: true,
        },
      ])
      .setFooter(`Made with ❤ by ${developer.tag}`, tvf.user.avatarURL());

      return msg.channel.send(embed);
  }
} as Command;

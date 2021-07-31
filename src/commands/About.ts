import ms from 'ms';
import si from 'systeminformation';
import bytes from 'pretty-bytes';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

class About extends Command {
    constructor() {
        super('about', {
            aliases: ['about', 'stats'],
            category: 'Core',
            description: 'Displays information about both the bot and the server!'
        });

        this.usage = 'about';
        this.examples = ['about'];
    }

    async exec(msg: Message) {
        const dev = this.client.server.member(this.client.ownerID[0]).user;
        const members = await this.client.server.members.fetch();
        const channels = this.client.server.channels.cache.filter(c => c.type !== 'category');
        const online = members.filter(m => m.user.presence.status === 'online');
        const textChannels = channels.filter(c => c.type === 'text');
        const voiceChannels = channels.filter(c => c.type === 'voice');
        const ramUsed = bytes(process.memoryUsage().heapTotal);
        const cpu = await si.currentLoad();
        const embed = this.client.utils.embed()
            .setColor(this.client.constants.Colours.Green)
            .setTitle('About! (:')
            .setAuthor(msg.author.username, msg.author.avatarURL())
            .setThumbnail(this.client.server.iconURL())
            .setFooter(`Made with ❤ by ${dev.tag}`, dev.avatarURL())
            .addField('RAM Used', ramUsed, true)
            .addField('CPU Usage', `${Math.round(cpu.currentLoad)}%`, true)
            .addField('Uptime', ms(this.client.uptime, { long: true }), true)
            .addField('Channels', channels.size, true)
            .addField('Text', textChannels.size, true)
            .addField('Voice', voiceChannels.size, true)
            .addField('Members', members.size, true)
            .addField('Online', online.size, true)
            .addField('Bots', members.filter(m => m.user.bot).size, true);

        msg.channel.send(embed);
        this.client.logger.command(`${this.client.userLogCompiler(msg.author)} requested information about both the bot and the server!`);
    }
}

module.exports = About;
export default About;

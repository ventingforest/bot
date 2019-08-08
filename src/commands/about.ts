import * as sys from 'systeminformation';
import * as ms from 'ms';
import * as prettyBytes from 'pretty-bytes';

const about: Command = {
    run: async (client, msg) => {
        try {
            const cpu = await sys.cpu();
            const ram = await sys.mem();
            const os = await sys.osInfo();
            const developer = msg.guild.members.get(client.config.devID).user;

            const embed = client
                .createEmbed('green', false)
                .setAuthor(developer.tag, developer.avatarURL())
                .addField('OS', `${os.distro} (${os.release})`)
                .addField(
                    'CPU',
                    `${cpu.manufacturer} ${cpu.brand} @ ${cpu.speed}GHz`
                )
                .addField('Total RAM', prettyBytes(ram.total), true)
                .addField('Uptime', ms(client.bot.uptime, { long: true }), true)
                .setFooter(
                    'Made with ❤ and discord.js',
                    'https://miro.medium.com/max/1200/1*mn6bOs7s6Qbao15PMNRyOA.png'
                );

            return msg.channel.send(embed);
        } catch (error) {
            client.logger.error(error);
            return msg.reply(
                'there was an issue whilst executing that command '
            );
        }
    },
    config: {
        name: 'about',
        description:
            'Information about the bot and the machine it is running on!',
        module: 'Core',
    },
};

export default about;

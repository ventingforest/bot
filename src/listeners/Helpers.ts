import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';

class Helpers extends Listener {
    constructor() {
        super('helperPing', {
            emitter: 'client',
            event: 'message',
        });
    }

    async exec(msg: Message) {
        if (
            this.client.production &&
            msg.content.includes(
                this.client.tvfRoles.community.helper.toString(),
            )
        ) {
            const helperEmbed = this.client.utils
                .embed()
                .setColor(this.client.constants.Colours.Yellow)
                .setThumbnail(this.client.server.iconURL())
                .setTitle(`${msg.author.username} needs help!`)
                .setDescription(`[Jump to the message.](${msg.url})`)
                .addField('Where?', msg.channel)
                .addField('Message', msg.content)
                .setTimestamp(new Date());

            this.client.tvfChannels.community.helper.send(helperEmbed);
            msg.channel.send(
                `${msg.author} - please wait, a helper will arrive shortly. If it's an emergency, call the number in ${this.client.tvfChannels.resources}. You can also request a one-on-one private session with a staff by typing ${this.client.prefix}private in any channel.`,
            );
        }
    }
}

module.exports = Helpers;

import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';

class CommandBlocked extends Listener {
    constructor() {
        super('commandBlocked', {
            emitter: 'commands',
            event: 'commandBlocked',
        });
    }

    exec(msg: Message, _command, reason: string) {
        if (reason === 'Commands can not be run in general!') {
            msg.delete();

            this.client.utils.sendAndDelete(
                `**${this.client.constants.Emojis.Cross}  |** Sorry, but you are not allowed to run commands in the general chats!`,
                msg.channel,
            );
        } else {
            msg.channel.send(
                `**${this.client.constants.Emojis.Cross}  |** Sorry, but you are not allowed to run that command!`,
            );
        }
    }
}

module.exports = CommandBlocked;

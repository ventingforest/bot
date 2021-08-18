import TVFCommand from '../../struct/TVFCommand';
import { Message } from 'discord.js';

class Say extends TVFCommand {
    constructor() {
        super('say', {
            aliases: ['say'],
            description: 'Repeats a message through the bot!',
            args: [
                {
                    id: 'message',
                    type: 'string',
                    match: 'rest',
                },
            ],
        });

        this.usage = 'say <message>';
        this.examples = ['say Hello!', "say You're cute!"];
    }

    exec(msg: Message, { message }: { message: string }) {
        msg.delete(); // Hide the evidence >w<

        // Repeat the message
        msg.channel.send(message);

        this.client.logger.command(
            `${this.client.userLogCompiler(
                msg.author,
            )} got me to say "${message}" :O`,
        );
    }
}

module.exports = Say;
export default Say;

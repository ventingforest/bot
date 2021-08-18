import { Inhibitor, Command } from 'discord-akairo';
import { Message } from 'discord.js';

class Name extends Inhibitor {
    constructor() {
        super('id', {
            reason: '',
        });
    }

    exec(msg: Message, command: Command) {
        return true; // ignore message
    }
}

module.exports = Name;

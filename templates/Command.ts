// @ts-nocheck REMOVE ME
import TVFCommand from '../../struct/TVFCommand';
import { Message } from 'discord.js';

class Name extends TVFCommand {
    constructor() {
        super('id', {
            aliases: ['name'],
            description: '',
        });

        this.usage = '';
        this.examples = [''];
    }

    exec(msg: Message) {}
}

module.exports = Name;
export default Name;

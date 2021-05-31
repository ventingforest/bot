// @ts-nocheck
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

class Name extends Command {
	constructor() {
		super('id', {
			aliases: ['name'],
			category: '',
			description: ''
		});

		this.usage = '';
		this.examples = [''];
	}

	exec(msg: Message) {
        
	}
}

module.exports = Name;
import { Inhibitor, Command } from 'discord-akairo';
import { Message } from 'discord.js';

class Admin extends Inhibitor {
    constructor() {
        super('admin', {
            reason: 'This command is restricted to admins only!',
        });
    }

    exec(msg: Message, command: Command) {
        if (command.categoryID === 'Admin') {
            return !msg.member.roles.cache.has(
                this.client.tvfRoles.staff.admins.id,
            );
        }
    }
}

module.exports = Admin;

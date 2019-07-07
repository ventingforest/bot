import { RichEmbed } from 'discord.js';

/*
.......##.......##....##.....##.########.##.......########.
......##.......##.....##.....##.##.......##.......##.....##
.....##.......##......##.....##.##.......##.......##.....##
....##.......##.......#########.######...##.......########.
...##.......##........##.....##.##.......##.......##.......
..##.......##.........##.....##.##.......##.......##.......
.##.......##..........##.....##.########.########.##.......
*/
export const command: Command = {
    run: (client, msg, args) => {
        // embed
        const embed = new RichEmbed()
            .setAuthor(client.user.tag, client.user.displayAvatarURL)
            .setThumbnail(client.user.displayAvatarURL);

        // spread all of the commands into arrays
        const commands = client.commands
            .filter(c => !c.config.admin)
            .map(c => c.config.name)
            .join(', ');

        const adminCommands = client.commands
            .filter(c => c.config.admin)
            .map(c => c.config.name)
            .join(', ');

        // if there are no arguments
        if (args.length === 0) {
            // update the embed accordingly
            embed
                .setTitle('Help 👋')
                .addField('Commands 🎉', `\`\`\`${commands}\`\`\``);

            if (msg.member.roles.find(r => r.id === '452553630105468957' || r.id === '462606587404615700')) {
                embed.addField('Admin ⚙', `\`\`\`${adminCommands}\`\`\``)
            }

            embed
                .addField('Support 🤗', 'If you ever spot a bug, please contact the Tech Admin and explain what is wrong so that they can get to fixing it.')
                .setFooter(`Current Tech Admin: ${msg.guild.roles.get('462606587404615700').members.map(m => m.user.tag).join(' ')}`);
        } else {
            // get the query
            const q = args[0].toLowerCase();

            // search for the command
            const cmd = client.commands.get(q);
            if (!cmd) return msg.reply('that command does not exist.');

            // setup the embed accordingly
            const { name, description, admin } = cmd.config;

            embed
                .setTitle(`Help - ${name}`)
                .setDescription(description ? description : 'No description given.');

            if (admin) embed.addField('Admin? ⚙', 'Yes.');
        }

        return msg.author.send(embed);
    },
    config: {
        name: 'help',
        description: 'Helps you use me!',
        dm: true
    }
}
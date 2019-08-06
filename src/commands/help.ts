import { isProduction } from './../Constants';

export const help: Command = {
    run: (client, msg, args) => {
        // embed
        const embed = client
            .createEmbed('random')
            .setAuthor(client.bot.user.tag, client.bot.user.avatarURL())
            .setThumbnail(client.bot.user.avatarURL());

        // spread all of the commands into arrays
        const commands = client.commands
            .filter((c) => c.config.module !== 'Admin')
            .filter((c) => c.config.module !== 'Mod')
            .filter((c) => c.config.module !== 'FK')
            .map((c) => c.config.name)
            .join(', ');

        const adminCommands = client.commands
            .filter((c) => c.config.module === 'Admin')
            .map((c) => c.config.name)
            .join(', ');

        const modCommands = client.commands
            .filter((c) => c.config.module === 'Mod')
            .map((c) => c.config.name)
            .join(', ');

        const fkCommands = client.commands
            .filter((c) => c.config.module === 'FK')
            .map((c) => c.config.name)
            .join(', ');

        // if there are no arguments
        if (args.length === 0) {
            // update the embed accordingly
            embed
                .setTitle('Help 👋')
                .addField('Commands 🎉', `\`\`\`${commands}\`\`\``);

            if (msg.member.roles.get(client.config.roles.fk)) {
                embed.addField('FK ♥', `\`\`\`${fkCommands}\`\`\``);
            }

            if (msg.member.roles.get(client.config.roles.mod)) {
                embed.addField('Mod 🔨', `\`\`\`${modCommands}\`\`\``);
            }

            if (
                msg.member.roles.get(client.config.roles.admin) ||
                msg.member.roles.get(client.config.roles.techAdmin)
            ) {
                embed.addField('Admin ⚙', `\`\`\`${adminCommands}\`\`\``);
            }

            embed
                .addField(
                    'Support 🤗',
                    'If you ever spot a bug, please contact the Tech Admin and explain what is wrong so that they can get to fixing it.'
                )
                .setFooter(
                    `Current Tech Admin: ${msg.guild.roles
                        .get(client.config.roles.techAdmin)
                        .members.map((m) => m.user.tag)
                        .join(', ')}`
                );
        } else {
            // get the query
            const q = args[0].toLowerCase();

            // search for the command
            const cmd = client.commands.get(q);
            if (!cmd) return msg.reply('that command does not exist.');

            // setup the embed accordingly
            const { name, description, module, usage } = cmd.config;

            embed
                .setTitle(`${name} Command Help`)
                .setDescription(
                    description ? description : 'No description given.'
                )
                .addField('Module ⚙', module);

            if (usage)
                embed.addField(
                    'Usage 🤓',
                    `${isProduction ? 'tvf ' : 'beta '}${name} ${usage}`
                );
        }

        return msg.author.send(embed);
    },
    config: {
        name: 'help',
        description: 'Helps you use me!',
        module: 'Core',
        dm: true,
    },
};

export default help;

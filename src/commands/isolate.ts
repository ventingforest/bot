import User from '../models/user';
import * as Discord from 'discord.js';

export const isolate: Command = {
    run: async (client, msg, args) => {
        await msg.delete();
        args.shift();

        // get the tagged member
        const member =
            msg.mentions.members.first() === undefined
                ? msg.guild.members.find(({ user }) => user.tag === args[0])
                : msg.mentions.members.first();
        if (!member)
            return msg.author.send(
                'you had to mention a user in order to isolate them.'
            );

        // prepare the reason
        let reason = args.join(' ');
        if (!reason) reason = 'No reason specified.';

        // get the member's document from the database
        const doc = await User.findOne({ id: member.user.id }, (err, res) => {
            if (err) return console.error(err);

            return res;
        });

        if (!doc.isolation.isolated) {
            // get an array of the member's roles
            const roles = member.roles.map((r) => r.id);

            // remove the roles from the member and add the isolated role
            await member.roles
                .remove(member.roles.array(), 'Isolated')
                .catch((err) => client.logger.error(err));
            await member.roles.add(client.config.roles.isolation, 'Isolated');

            // update and save the document
            doc.isolation.roles = roles;
            doc.isolation.isolated = true;

            doc.save().catch((error) => console.error(error));

            // alert the staff
            const embed = client
                .createEmbed('red')
                .setTitle('Isolated')
                .setDescription(`${member.user.tag} has been isolated.`)
                .addField('Target', member.user, true)
                .addField('Isolated by', msg.author, true)
                .addField('Reason', reason);

            client.bot.channels
                .get(client.config.channels.fk)
                // @ts-ignore
                .send(embed);

            // post a message in the isolated channel
            return (
                client.bot.channels
                    .get(client.config.channels.isolation)
                    // @ts-ignore
                    .send(
                        `Hey there, <@!${member.user.id}>. You have been isolated. Don't worry - this doesn't necessarily mean that you have done anything wrong. We have put you here in order to help you calm down if you're feeling bad, or if you are bringing harm to other members of the server. Within this channel there is only you and the staff - feel free to talk to them.`
                    )
            );
        } else if (doc.isolation.isolated) {
            // get the roles from the database
            let roles: Discord.Collection<
                string,
                Discord.Role
            > = new Discord.Collection();

            for (let i = 0; i < doc.isolation.roles.length; i++) {
                const id = doc.isolation.roles[i];
                const role = msg.guild.roles.get(id);
                roles.set(id, role);
            }

            await member.roles
                .add(roles, 'Un-isolated')
                .catch((err) => client.logger.error(err));
            await member.roles.remove(
                client.config.roles.isolation,
                'Un-isolated'
            );

            // update and save the document
            doc.isolation.roles = [];
            doc.isolation.isolated = false;

            // alert the staff
            const embed = client
                .createEmbed('green')
                .setTitle('Un-isolated')
                .setDescription(
                    `${member.user.tag} has been un-isolated by <@!${msg.author.id}>`
                );

            client.bot.channels
                .get(client.config.channels.fk)
                // @ts-ignore
                .send(embed);

            return doc.save().catch((error) => console.error(error));
        }
    },
    config: {
        name: 'isolate',
        module: 'Mod',
        description: 'Isolates a user!',
        args: true,
        usage: '<@user> *reason*',
    },
};

export default isolate;

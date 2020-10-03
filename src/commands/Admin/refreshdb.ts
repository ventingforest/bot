import User from '../../models/user';

export default {
	name: 'refreshdb',
	description: 'Refreshes the database, ensuring that everyone in the server has a document.',
    allowGeneral: true,
    staffAccess: ['Admin'],
	run: async (tvf, msg) => {
        let i = 0;

        tvf.server.members.cache.forEach(async member => {
            const doc = await User.findOne({ id: member.id }, (err, res) => err ? tvf.logger.error(err) : res) || undefined;

            // If I can not find the document, create one for the user
            if (!doc) {
                await User.create({ id: member.id });
                i++;
            }
        })

        msg.channel.send(`**${tvf.emojis.tick}  |**  refreshed database! Created ${i} documents!`);
	}
} as Command;

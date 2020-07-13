import User from '../../models/user';

export default {
	name: 'prunedb',
	description: 'Prunes the database, deleting documents for everyone who is no longer in the server.',
	allowGeneral: true,
	run: async (tvf, msg) => {
        const count = await User.find({ inServer: false }, (err, res) => err ? tvf.logger.error(err) : res.length);
        await User.deleteMany({ inServer: false }, err => err ? tvf.logger.error(err) : null);
        msg.channel.send(`**${tvf.emojis.tick}  |**  pruned database! Deleted ${count} documents!`);
	}
} as Command;

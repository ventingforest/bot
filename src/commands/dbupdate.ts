import User from '../models/user';

const dbupdate: Command = {
	run: (tvf, msg) => {
		let amount = 0;

		msg.guild.members.forEach(async (m) => {
			const doc = await tvf.db.users
				.findOne({ id: m.user.id })
				.then((res) => res);

			if (!doc && !m.user.bot) {
				++amount;

				return User.create({
					id: m.user.id,
					tag: m.user.tag,
					isolation: { isolated: false, roles: [] },
				});
			}
		});

		return msg.reply(`added ${amount} documents.`);
	},
	config: {
		name: 'dbupdate',
		module: 'Admin',
	},
};

export default dbupdate;

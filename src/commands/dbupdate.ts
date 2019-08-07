import User from '../models/user';

const dbupdate: Command = {
    run: (client, msg) => {
        msg.guild.members.forEach(async (m) => {
            const doc = await client.db.users
                .findOne({ id: m.user.id })
                .then((res) => res);

            if (!doc && !m.user.bot) {
                return User.create({
                    id: m.user.id,
                    tag: m.user.tag,
                    isolation: { isolated: false, roles: [] },
                });
            }
        });
    },
    config: {
        name: 'dbupdate',
        module: 'Admin',
    },
};

export default dbupdate;

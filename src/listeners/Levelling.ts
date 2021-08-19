import { stripIndents } from 'common-tags';
import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';

class Levelling extends Listener {
    constructor() {
        super('msg', {
            emitter: 'client',
            event: 'message',
        });
    }

    async exec(msg: Message) {
        if (
            this.client.production &&
            !this.client.social.xpCooldown.has(msg.author.id) &&
            !msg.author.bot
        ) {
            const user = await this.client.db.user.findUnique({
                where: { id: msg.author.id },
            });

            let { xp, level } = user;

            xp += Math.floor(Math.random() * 25) + 15;
            level = user.level;

            // Level up!
            if (xp >= this.client.social.xpFor(level + 1)) {
                level++;

                const currentLevelRole = this.client.social.levelReward(level) || this.client.constants.levelRoles[this.client.constants.levelRoles.length - 1];

                const levelUp = this.client.utils.embed()
                    .setTitle('Level Up!')
                    .setColor(this.client.constants.Colours.Green)
                    .setThumbnail(msg.author.avatarURL());
                
                var description = `Congratulations  ${this.client.constants.Emojis.Confetti}\n\nYour magical ability has advanced to **Level ${level}**`;

                if (level > this.client.constants.levelRoles[this.client.constants.levelRoles.length - 1].level) {
                    description = description;
                }
                else if (level % 2 === 0) {
                    description += `\nYou are now a ${currentLevelRole.name} <3`;
                } else {
                    const nextLevelRole = this.client.constants.levelRoles[this.client.constants.levelRoles.indexOf(currentLevelRole) + 1];
                    const xpAway = this.client.social.xpFor(nextLevelRole.level) - this.client.social.xpFor(currentLevelRole.level);
                    description += `\nYou are now ${xpAway.toLocaleString()} xp from becoming a ${nextLevelRole.name} <3`;
                }

                levelUp.setDescription(description);
                msg.channel.send(msg.author, levelUp);
            }

            await this.client.db.user.update({
                where: { id: user.id },
                data: {
                    xp,
                    level,
                },
            });

            if (level % 2 === 0 && level <= 100) {
                const newRole = this.client.constants.levelRoles.find(
                    (r) => r.level === user.level,
                );
                const oldRole =
                    this.client.constants.levelRoles[
                        this.client.constants.levelRoles.indexOf(newRole) - 1
                    ];
                const member = msg.guild.member(msg.author.id);

                if (user.level !== 2)
                    member.roles.remove(
                        oldRole.roleID,
                        `Levelled up to ${newRole.level}!`,
                    );
                member.roles.add(
                    newRole.roleID,
                    `Levelled up to ${newRole.level}!`,
                );
            }

            // Put them on timeout for a minute
            this.client.social.xpCooldown.add(msg.author.id);
            setTimeout(
                () => this.client.social.xpCooldown.delete(msg.author.id),
                60000,
            );
        }
    }
}

module.exports = Levelling;

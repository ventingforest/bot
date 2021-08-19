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
            !this.client.social.xpCooldown.has(msg.author.id)
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

                const currentLevelReward =
                    this.client.social.levelReward(user.level) ||
                    this.client.constants.levelRoles[
                        this.client.constants.levelRoles.length - 1
                    ];
                const nextLevelReward =
                    this.client.constants.levelRoles[
                        this.client.constants.levelRoles.indexOf(
                            currentLevelReward,
                        ) + 1
                    ];

                if (user.level % 2 === 0) {
                    this.client.tvfChannels.community.levelUp.send(
                        `**${
                            this.client.constants.Emojis.Confetti
                        }  |** Congratulations, ${
                            msg.author
                        }! Your magical ability has advanced to **Level ${
                            user.level
                        }** in The Venting Forest! You are now a **${
                            currentLevelReward.name
                        }**${
                            nextLevelReward
                                ? `, and are ${
                                      this.client.social.xpFor(
                                          nextLevelReward.level,
                                      ) -
                                      this.client.social.xpFor(
                                          currentLevelReward.level,
                                      )
                                  } xp from becoming a **${
                                      nextLevelReward.name
                                  }**`
                                : ''
                        }!`,
                    );
                } else {
                    this.client.tvfChannels.community.levelUp.send(
                        `**${
                            this.client.constants.Emojis.Confetti
                        }  |** Congratulations! Your magical ability has advanced to **Level ${
                            user.level
                        }** in The Venting Forest!${
                            nextLevelReward
                                ? ` You are now ${
                                      this.client.social.xpFor(
                                          nextLevelReward.level,
                                      ) -
                                      this.client.social.xpFor(
                                          currentLevelReward.level,
                                      )
                                  } xp from becoming a **${
                                      nextLevelReward.name
                                  }**!`
                                : ''
                        } You are currently a **${currentLevelReward.name}**.`,
                    );
                }
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

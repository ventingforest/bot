import TVFCommand from '../../struct/TVFCommand';
import { Message, GuildMember, MessageAttachment } from 'discord.js';
import { RankCard } from '@ayanobot/rankcard';

class Level extends TVFCommand {
    constructor() {
        super('level', {
            aliases: ['level', 'rank'],
            category: 'Core',
            description: 'Checks the level of someone!',
            args: [
                {
                    id: 'argMember',
                    type: 'member',
                    index: 0
                }
            ]
        });

        this.usage = 'level [@user]';
        this.examples = ['level', 'level @newt guillén <3'];
    }

    async exec(msg: Message, { argMember }: { argMember: GuildMember }) {
        const member = argMember || msg.member;
        const users = await this.client.db.user.findMany({
            orderBy: { xp: 'desc' }
        });
        const filteredUsers = users.filter(
            (user) => this.client.server.member(user.id) !== null
        );
        const user = users.find((u) => u.id === member.id);
        const rank = filteredUsers.map((d) => d.xp).indexOf(user.xp) + 1;
        let color = member.roles.highest.hexColor;
        if (color === '#000000') color = '#ffffff';

        // Build the rank card
        const rankCard = new RankCard({
            level: user.level,
            xpForLevel: this.client.social.xpFor,
            user: member,
            rank
        });

        rankCard.build().then((data) => {
            const attachment = new MessageAttachment(data, 'RankCard.png');
            const currentLevelReward = this.client.social.levelReward(
                user.level
            );

            const nextLevelReward =
                this.client.constants.levelRoles[
                    this.client.constants.levelRoles.indexOf(
                        currentLevelReward
                    ) + 1
                ];
            const beginning =
                member === msg.member
                    ? 'You are'
                    : `${member.user.username} is`;

            msg.channel.send(
                `**${this.client.constants.Emojis.Confetti}  |** ${
                    nextLevelReward
                        ? ` ${beginning} ${(
                              this.client.social.xpFor(nextLevelReward.level) -
                              user.xp
                          ).toLocaleString()} xp away from **${
                              nextLevelReward.name
                          }!**`
                        : ''
                } ${
                    currentLevelReward
                        ? `${beginning} currently a **${currentLevelReward.name}**.`
                        : ''
                }`,
                attachment
            );
        });

        this.client.logger.command(
            `${this.client.userLogCompiler(msg.author)} requested ${
                member === msg.member
                    ? 'their'
                    : `${this.client.userLogCompiler(member.user)}'s`
            } rank card.`
        );
    }
}

module.exports = Level;
export default Level;

import ord from 'ord';

export default {
	name: 'level',
    description: 'Checks someone\'s level!',
    aliases: ['rank'],
    args: false,
    usage: 'level [@user]',
	allowGeneral: false,
	run: async (tvf, msg, args) => {
        const member = tvf.checkForMember(msg, args) || msg.guild.member(msg.author); // find a member in the command
        const doc = await tvf.userDoc(member.id); // get the member's document
        const rank = await tvf.rankOnLevelLeaderboard(member.id);
        
        msg.channel.send(`You are level ${doc.level}, with ${tvf.formatNumber(doc.xp)}xp. This puts you in ${tvf.formatNumber(rank)}${ord(rank)} place!`)
	}
} as Command;

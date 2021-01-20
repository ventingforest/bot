export default {
	name: 'setlevel',
    description: 'Set the level of a member!',
    aliases: ['setrank'],
    args: true,
    usage: 'setlevel <@user> <level>',
    staffAccess: ['Admin'],
	allowGeneral: true,
	run: async (tvf, msg, args, { prefix }) => {
        const member = tvf.checkForMember(msg, args) || msg.guild.member(msg.author); // find a member in the command
        const doc = await tvf.userDoc(member.id); // get the member's document

        // set the new level
        doc.level = parseInt(args[1]); 
        doc.xp = tvf.levels.xpFor(doc.level);
        await tvf.saveDoc(doc);

        msg.channel.send(`**${member.user.tag}** is now level **${doc.level}**`);
	}
} as Command;

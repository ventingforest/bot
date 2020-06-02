import * as Discord from 'discord.js';

export default {
	name: 'aromantic',
	description: 'Overlay an aromantic pride flag over your profile picture!',
	run: async (tvf, msg, args) => {
  	const opacity = (parseInt(args[0]) / 100) || 0.5;

  	if (opacity > 1) {
    	return msg.channel.send(`**${tvf.emojis.cross}  |**  The provided opacity has to be below 100!`);
  	}

  	msg.channel.send(new Discord.MessageAttachment(await tvf.pridePfp(msg.author, 'aromantic', opacity)));
	}
} as Command;

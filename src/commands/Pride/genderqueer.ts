import axios from 'axios';
import * as Discord from 'discord.js';

export default {
	name: 'genderqueer',
	description: 'Overlay a genderqueer pride flag over your profile picture!',
	allowGeneral: true,
	run: async (_tvf, msg) => {
    // fetch the user's avatar
    const pride = await axios.get(`https://apride.glitch.me/api/genderqueer?url=${msg.author.avatarURL({ size: 256, format: 'png' })}`, { responseType: 'arraybuffer' });
    const attachment = new Discord.MessageAttachment(pride.data, `${msg.author.username}-pride.png`);
    msg.channel.send(attachment);
	}
} as Command;

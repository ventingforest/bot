import * as Discord from 'discord.js';
import Client from '../Client';
import timeout from 'timeout';
import moment from 'moment';
import { stripIndents } from 'common-tags';

export default async (tvf: Client, member: Discord.GuildMember) => {
	if (tvf.isProduction) {
		// get the user's document
		const doc = await tvf.userDoc(member.id);

		doc.stickyRoles = member.roles.cache.map(r => r.id).filter(r => r !== '435894444101861408');

		// if the user has requested a pending venting session, clear the expiry timeout
		if (doc.private.requested) {
			timeout.timeout(doc.private.id, null);
			timeout.timeout(`${doc.private.id}1`, null);
			timeout.timeout(`${doc.private.id}2`, null);
			timeout.timeout(`${doc.private.id}3`, null);
			timeout.timeout(`${doc.private.id}4`, null);
			timeout.timeout(`${doc.private.id}5`, null);
		}

		// if the user is in a private venting session, end it
		if (doc.private.startedAt && doc.private.startedAt !== null) {
			// Fetch the channels associated with the session
			const text = tvf.server.channels.cache.get(doc.private.channels.text) as Discord.TextChannel;
			const vc = tvf.server.channels.cache.get(doc.private.channels.vc) as Discord.VoiceChannel;
	  
			// Calculate important things for later
			const startedAt = moment(doc.private.startedAt).format(tvf.moment);
			const endedAt = moment(new Date()).format(tvf.moment);
	  
			// Upload the message history to pastebin
			const messages = text.messages.cache;
			
			const paste = await tvf.pastebin.createPaste({
			  title: `Private Venting Session - ${member.user.tag} - ${endedAt}`,
			  text: stripIndents`
				Venter: ${member.user.tag} (${member.user.id})
				Reason: ${doc.private.reason}
				Started at: ${startedAt}
				Ended at: ${endedAt}
				Message count: ${messages.size}
				----------------------------------
				${messages.map(msg => `${moment(msg.createdTimestamp).format('D/M/YYYY HH:MM')} ${msg.author.tag}: ${msg.content}`).join('\n')}
			  `,
			  format: null,
			  privacy: 1,
			});
	  
			// Inform the support team that the session has ended and post it in the logs 
			const sessionEnded = tvf.createEmbed({ colour: tvf.const.red, timestamp: true, thumbnail: false })
			  .setThumbnail(member.user.avatarURL())
			  .setAuthor(tvf.user.tag, tvf.user.avatarURL())
			  .setTitle(`${member.user.username}'s session is over!`)
			  .setDescription('The user has left the server.')
			  .addFields([
				{ name: 'Time open', value: `${moment(new Date()).diff(moment(doc.private.startedAt), 'minutes')} minutes` },
				{ name: 'Started at', value: startedAt, inline: true },
				{ name: 'Ended at', value: endedAt, inline: true },
				{ name: 'Reason', value: doc.private.reason },
				{ name: 'Message count', value: messages.size, inline: true },
				{ name: 'Pastebin', value: paste ? paste : 'Maximum daily paste upload met. Functionality will return in 24h.', inline: true },
			  ])
			  .setFooter(`Session ID: ${doc.private.id}`, tvf.server.iconURL());
	  
			tvf.const.staffChannels.support.send(sessionEnded);
			tvf.const.staffChannels.private.logs.send(sessionEnded);
	  
			// Delete the channels associated with the session
			await text.delete();
			await vc.delete();
		}

		tvf.saveDoc(doc);

		// send goodbye message
		tvf.const.general.send(`**${member.user.tag}** has exited the Forest.`);
	}
};

import * as Discord from 'discord.js';
import Client from '../Client';
import User from '../models/user';
import timeout from 'timeout';
import moment from 'moment';
import { stripIndents } from 'common-tags';

export default async (tvf: Client, member: Discord.GuildMember) => {
	if (!tvf.isProduction) {
		// get the user's document
		const doc = await tvf.userDoc(member.id);

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
			const sessionEnded = tvf.createEmbed({ colour: tvf.colours.red, timestamp: true, thumbnail: false })
			  .setThumbnail(member.user.avatarURL())
			  .setAuthor(tvf.bot.user.tag, tvf.bot.user.avatarURL())
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
	  
			tvf.channels.staff.support.send(sessionEnded);
			tvf.channels.staff.private.logs.send(sessionEnded);
	  
			// Delete the channels associated with the session
			await text.delete();
			await vc.delete();
		}

		// if the user is isolated, end it
		if (doc.isolation.isolated) {
			// Fetch the channels associated with the isolation
			const text = tvf.server.channels.cache.get(doc.isolation.channels.text) as Discord.TextChannel;
			const vc = tvf.server.channels.cache.get(doc.isolation.channels.vc) as Discord.VoiceChannel;
	
			// Calculate important things for later
			const isolatedAt = moment(doc.isolation.isolatedAt).format(tvf.moment);
			const unisolatedAt = moment(new Date()).format(tvf.moment);
	
			// Upload the message history to pastebin
			const messages = text.messages.cache;
			const user = tvf.server.member(doc.id).user;
	
			const paste = await tvf.pastebin.createPaste({
			  title: `Isolation - ${user.tag} - ${unisolatedAt}`,
			  text: stripIndents`
				User isolated: ${user.tag} (${user.id})
				Reason: ${doc.isolation.reason}
				Isolated at: ${isolatedAt}
				Unisolated at: ${unisolatedAt}
				Message count: ${messages.size}
				----------------------------------
			  ${messages.map(msg => `${moment(msg.createdTimestamp).format('D/M/YYYY HH:MM')} ${msg.author.tag}: ${msg.content}`).join('\n')}
			  `,
			  format: null,
			  privacy: 1,
			});
	
			// Inform the support and moderation teams that the isolation is over and post it in the logs 
			const isolationEnded = tvf.createEmbed({ colour: tvf.colours.red, timestamp: true, thumbnail: false })
			  .setThumbnail(user.avatarURL())
			  .setAuthor(tvf.bot.user.tag, tvf.bot.user.avatarURL())
			  .setTitle(`${user.username} has been unisolated!`)
			  .setDescription('The user has left the server.')
			  .addFields([
				{ name: 'Time isolated', value: `${moment(new Date()).diff(moment(doc.isolation.isolatedAt), 'minutes')} minutes` },
				{ name: 'Isolated at', value: isolatedAt, inline: true },
				{ name: 'Unisolated at', value: unisolatedAt, inline: true },
				{ name: 'Reason', value: doc.isolation.reason },
				{ name: 'Notes', value: 'The user has left the server.' },
				{ name: 'Isolated by', value: tvf.server.member(doc.isolation.isolatedBy).user.username, inline: true },
				{ name: 'Unisolated by', value: tvf.bot.user.username, inline: true },
				{ name: 'Message count', value: messages.size, inline: true },
				{ name: 'Pastebin', value: paste ? paste : 'Maximum daily paste upload met. Functionality will return in 24h.', inline: true },
			  ]);
	
		  tvf.channels.staff.moderators.chat.send(isolationEnded);
		  tvf.channels.staff.moderators.modlogs.send(isolationEnded);
		  tvf.channels.staff.support.send(isolationEnded);
		  tvf.channels.staff.isolation.logs.send(isolationEnded);
	
		  // Delete the channels associated with the session
		  await text.delete();
		  await vc.delete();
		}

		// delete the member.user's document
		await User.deleteOne({ id: member.id });

		// send goodbye message
		tvf.channels.general.send(`**${member.user.tag}** has exited the Forest.`);
	}
};

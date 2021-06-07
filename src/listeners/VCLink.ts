import { Listener } from 'discord-akairo';
import { TextChannel, VoiceState } from 'discord.js';

class VCLink extends Listener {
	constructor() {
		super('vcLink', {
			emitter: 'client',
			event: 'voiceStateUpdate'
		});
	}

	leaveChannel(id: string, state: VoiceState) {
		// Get the associated text channel and announce departure
		const oldChannel = this.client.server.channels.cache.get(this.client.constants.vcLink[id]) as TextChannel;
		oldChannel.send(`${state.member} left ${state.channel.name}! Bye bye!`);

		// Delete any permission overwrites
		const o = oldChannel.permissionOverwrites.get(state.member.id);
		if (o) {
			o.delete();
		}
	}

	exec(oldState: VoiceState, newState: VoiceState) {
		const oldChannel = oldState.channelID;
	    const newChannel = newState.channelID;

	    if (Object.keys(this.client.constants.vcLink).includes(newChannel) || Object.keys(this.client.constants.vcLink).includes(oldChannel)) { // If there is a link for the VC the user has joined
			// If the user has joined the voice channel
			if (oldChannel !== newChannel && typeof newChannel === 'string') {
				const newC = this.client.server.channels.cache.get(this.client.constants.vcLink[newChannel]) as TextChannel; // Get the associated text channel
				newC.updateOverwrite(newState.member.id, { VIEW_CHANNEL: true, SEND_MESSAGES: true, READ_MESSAGE_HISTORY: true, ADD_REACTIONS: true }); // Let the user speak in the channel
				newC.send(`${newState.member} joined ${newState.channel.name}! Say hi (:`);

				if (oldChannel !== null) {
					this.leaveChannel(oldChannel, oldState);
				}
			}
			
			// If the user has left the voice channel
			else {
				this.leaveChannel(oldChannel, oldState);
			}
		}
	}
}

module.exports = VCLink;

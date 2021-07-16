import { ClientUtil } from 'discord-akairo';
import { GuildMember, Message, User } from 'discord.js';
import TVFClient from './TVFClient';
import * as jimp from 'jimp';
import * as path from 'path';
import { Canvas } from 'canvas';

export default class TVFUtils extends ClientUtil {	
	/**
	 * Initialises an instance of the TVFUtils helper
	 * @param client An instance of TVF Bot
	 */
	constructor(client: TVFClient) {
		super(client);
	}

	/**
	 * Checks if a user has a staff role.
	 * @param {StaffRole | 'Staff'} role
	 * @param {Discord.GuildMember} member
	 */
	isUser(role: StaffRole, member: GuildMember): boolean {
		return role === 'Support' ? member.roles.cache.has(this.client.tvfRoles.staff.support.id) || member.roles.cache.has(this.client.tvfRoles.staff.supportHead.id) || member.roles.cache.has(this.client.tvfRoles.staff.admins.id)
			: role === 'Moderation' ? member.roles.cache.has(this.client.tvfRoles.staff.moderators.id) || member.roles.cache.has(this.client.tvfRoles.staff.modHead.id) || member.roles.cache.has(this.client.tvfRoles.staff.admins.id)
				: role === 'Admin' ? member.roles.cache.has(this.client.tvfRoles.staff.admins.id)
					: role === 'Staff' ? member.roles.cache.has(this.client.tvfRoles.staff.staff.id)
						: false;
	}

	/**
	 * Send a DM to a member!
	 * @param {User} user
	 * @param {MessageContent} content
	 */
	async sendDM(user: User, content: MessageContent): Promise<Message> {
		return user.send(content).catch(() => {
			const embed = this.embed()
				.setTitle('Sorry, I was unable to DM you!')
				.setDescription('I tried to send you a DM, but there was an issue! This may be because you are not accepting DMs from server members. Please check if you have got it enabled, as shown below!')
				.setThumbnail(this.client.server.iconURL())
				.setImage('https://i.imgur.com/iY7a8RO.png');

			this.client.tvfChannels.community.discussion.send(embed);
		}) as Promise<Message>;
	}

	/**
	 * Clean up prompts!
	 * @param {Message} msg
	 */
	deletePrompts(msg: Message) {
		if (msg.util.messages.size > 0) msg.util.messages.forEach(m => m.delete({ reason: 'Cleaning prompts.' }));
	}

	/**
	 * Overlays a pride flag over an image buffer.
	 * @param {Buffer} buffer
	 * @param {string} type
	 * @param {number} opacity
	 */
	async pride(buffer: Buffer, type: string, opacity: number): Promise<Buffer> {
		// load the necessary images
		const image = await jimp.read(buffer);
		const flag = await jimp.read(path.resolve(`assets/pride/${type}.png`));

		// resize the flag and set opacity
		flag.resize(image.getWidth(), image.getHeight());
		flag.opacity(opacity);

		// overlay the flag onto the image
		image.blit(flag, 0, 0);

		// return the manipulated image's buffer
		return image.getBufferAsync(jimp.MIME_PNG);
	}

	/**
	 * Resizes font size based on canvas
	 * @param canvas The canvas instance
	 * @param fontSize The initial font size
	 * @param text The text to resize for
	 * @returns The new definition for the font
	 */
	applyText(canvas: Canvas, fontSize: number, text: string): string {
		const context = canvas.getContext('2d');
	
		do {
			context.font = `${fontSize -= 5}px League Spartan`;
		} while (context.measureText(text).width > canvas.width - 475);

		return context.font;
	}
}

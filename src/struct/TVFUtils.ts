import { ClientUtil } from 'discord-akairo';
import {
    APIMessageContentResolvable,
    DMChannel,
    GuildMember,
    Message,
    MessageAdditions,
    MessageOptions,
    NewsChannel,
    TextChannel,
} from 'discord.js';
import TVFClient from './TVFClient';
import * as jimp from 'jimp';
import * as path from 'path';

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
        return role === 'Support'
            ? member.roles.cache.has(this.client.tvfRoles.staff.support.id) ||
                  member.roles.cache.has(
                      this.client.tvfRoles.staff.supportHead.id,
                  ) ||
                  member.roles.cache.has(this.client.tvfRoles.staff.admins.id)
            : role === 'Moderation'
            ? member.roles.cache.has(
                  this.client.tvfRoles.staff.moderators.id,
              ) ||
              member.roles.cache.has(this.client.tvfRoles.staff.modHead.id) ||
              member.roles.cache.has(this.client.tvfRoles.staff.admins.id)
            : role === 'Admin'
            ? member.roles.cache.has(this.client.tvfRoles.staff.admins.id)
            : role === 'Staff'
            ? member.roles.cache.has(this.client.tvfRoles.staff.staff.id)
            : false;
    }

    /**
     * Clean up prompts!
     * @param {Message} msg
     */
    deletePrompts(msg: Message) {
        if (msg.util.messages.size > 0)
            msg.util.messages.forEach((m) =>
                m.delete({ reason: 'Cleaning prompts.' }),
            );
    }

    /**
     * Overlays a pride flag over an image buffer.
     * @param {Buffer} buffer
     * @param {string} type
     * @param {number} opacity
     */
    async pride(
        buffer: Buffer,
        type: string,
        opacity: number,
    ): Promise<Buffer> {
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
     * Send a message and promptly delete it
     * @param content The content of the message
     * @param channel The channel to send it to
     * @param seconds How many seconeds later to delete it
     */
    sendAndDelete(
        content:
            | APIMessageContentResolvable
            | (MessageOptions & {
                  split?: false;
              })
            | MessageAdditions,
        channel: TextChannel | NewsChannel | DMChannel,
        seconds = 5,
    ) {
        channel
            .send(content)
            .then((msg) => msg.delete({ timeout: seconds * 1000 }));
    }
}

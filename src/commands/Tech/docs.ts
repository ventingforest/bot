import * as Discord from 'discord.js';
import axios from 'axios';

export default {
  name: 'docs',
  description: 'Allows you to search the discord.js documentation',
  args: true,
  usage: '<query> [stable|master=master]',
  staffAccess: ['Tech'],
  run: async (tvf, msg, args) => {
    // get the data
    const source = ['stable', 'master'].includes(args.slice(-1)[0]) ? args.pop() : 'master';
    const embed = (await axios.get(`https://djsdocs.sorta.moe/v2/embed?src=${source}&q=${args.join(' ')}`)).data;

    // if the data could not be fetched
    if (!embed) {
      return msg.channel.send(`**${tvf.emojis.cross}  |**  I couldn\'t find the requested information. Ensure that \`${source}\` is an existing branch, or consider looking for something that exists next time!`);
    }

    // if the bot doesn't have permission to delete messages
    if ((msg.channel as Discord.TextChannel).permissionsFor(msg.guild.me).has(['ADD_REACTIONS', 'MANAGE_MESSAGES'], false)) {
      return msg.channel.send({ embed });
    }

    // message deletion by reaction
    const msg2 = await msg.channel.send({ embed });
    msg2.react(tvf.emojis.bin);

    let react: Discord.Collection<string, Discord.MessageReaction>;

    // listen for a reaction from the author
    try {
      react = await msg2.awaitReactions((reaction, user): boolean => reaction.emoji.name === tvf.emojis.bin && user.id === msg.author.id, { max: 1, time: 10000, errors: ['time'] });
    } catch (error) {
      // if the author doesn't react, remove all reactions from the message
      msg2.reactions.removeAll();
      return msg2;
    }

    // if the author reacts, delete the message
    msg.delete();
    react.first().message.delete();
    return msg2;
  }
} as Command;

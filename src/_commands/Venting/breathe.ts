import * as Discord from 'discord.js';

export default {
  name: 'breathe',
  description: 'Posts a GIF showing you how to breathe.',
  aliases: ['breathing'],
  run: async (_tvf, msg) => msg.channel.send(new Discord.MessageAttachment('https://media.giphy.com/media/krP2NRkLqnKEg/giphy.gif')),
} as Command;

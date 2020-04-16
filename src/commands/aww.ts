import * as Discord from 'discord.js';

export default {
  name: 'aww',
  description: 'Get a cute picture ^w^',
  module: 'Core',
  usage: 'aww',
  examples: ['aww'],
  run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment((await tvf.ksoft.images.aww()).url)),
} as Command;

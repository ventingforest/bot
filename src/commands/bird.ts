import * as Discord from 'discord.js';

export default {
  name: 'bird',
  description: 'Get a picture of a bird ^w^',
  module: 'Core',
  usage: 'bird',
  examples: ['bird'],
  run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment((await tvf.randomImage('birb')).url)),
} as Command;

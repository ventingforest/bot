import * as Discord from 'discord.js';

export default {
  name: 'dog',
  description: 'Get a picture of a dog ^w^',
  module: 'Core',
  usage: 'dog',
  examples: ['dog'],
  run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment((await tvf.randomImage('dog')).url)),
} as Command;

import * as Discord from 'discord.js';

export default {
  name: 'fox',
  description: 'Get a picture of a fox ^w^',
  module: 'Core',
  usage: 'fox',
  examples: ['fox'],
  run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment((await tvf.ksoft.images.random('fox', { nsfw: false })).url)),
} as Command;

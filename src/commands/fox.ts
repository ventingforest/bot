import * as Discord from 'discord.js';

export default {
  name: 'fox',
  description: 'Get a picture of a fox ^w^',
  module: 'Core',
  aliases: ['foxo', 'foxy'],
  run: async (tvf, msg) => msg.channel.send(new Discord.MessageAttachment((await tvf.randomImage('fox')).url)),
} as Command;

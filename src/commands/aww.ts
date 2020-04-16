import * as Discord from 'discord.js';

export default {
  name: 'aww',
  description: 'Get a cute picture ^w^',
  module: 'Core',
  usage: 'aww',
  examples: ['aww'],
  run: async (tvf, msg) => {
    let img = (await tvf.ksoft.images.aww()).url;

    do {
      img = (await tvf.ksoft.images.aww()).url;
    } while (!(/.jpg|.jpeg|.png|.webp|.gif/.test(img)))

    msg.channel.send(new Discord.MessageAttachment(img));
  },
} as Command;

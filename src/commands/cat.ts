import * as Discord from 'discord.js';

export default {
  name: 'cat',
  description: 'Get a picture of a cat ^w^',
  module: 'Core',
  usage: 'cat',
  examples: ['cat'],
  run: async (tvf, msg) => {
    let img = (await tvf.ksoft.images.random('cat', { nsfw: false })).url;

    do {
      img = (await tvf.ksoft.images.random('cat', { nsfw: false })).url;
    } while (!(/.jpg|.jpeg|.png|.webp|.gif/.test(img)))

    msg.channel.send(new Discord.MessageAttachment(img));
  },
} as Command;

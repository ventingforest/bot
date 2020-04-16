import * as Discord from 'discord.js';

export default {
  name: 'fox',
  description: 'Get a picture of a fox ^w^',
  module: 'Core',
  usage: 'fox',
  examples: ['fox'],
  run: async (tvf, msg) => {
    let img = (await tvf.ksoft.images.random('fox', { nsfw: false })).url;

    do {
      img = (await tvf.ksoft.images.random('fox', { nsfw: false })).url;
    } while (!(/.jpg|.jpeg|.png|.webp|.gif/.test(img)))

    msg.channel.send(new Discord.MessageAttachment(img));
  },
} as Command;

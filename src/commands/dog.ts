import * as Discord from 'discord.js';

export default {
  name: 'dog',
  description: 'Get a picture of a dog ^w^',
  module: 'Core',
  usage: 'dog',
  examples: ['dog'],
  run: async (tvf, msg) => {
    let img = (await tvf.ksoft.images.random('dog', { nsfw: false })).url;

    do {
      img = (await tvf.ksoft.images.random('dog', { nsfw: false })).url;
    } while (!(/.jpg|.jpeg|.png|.webp|.gif/.test(img)))

    msg.channel.send(new Discord.MessageAttachment(img));
  },
} as Command;

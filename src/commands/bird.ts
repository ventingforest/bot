import * as Discord from 'discord.js';

export default {
  name: 'bird',
  description: 'Get a picture of a bird ^w^',
  module: 'Core',
  usage: 'bird',
  examples: ['bird'],
  run: async (tvf, msg) => {
    let img = (await tvf.ksoft.images.random('bird', { nsfw: false })).url;

    do {
      img = (await tvf.ksoft.images.random('bird', { nsfw: false })).url;
    } while (!(/.jpg|.jpeg|.png|.webp|.gif/.test(img)))

    msg.channel.send(new Discord.MessageAttachment(img));
  },
} as Command;

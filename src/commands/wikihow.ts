import * as Discord from 'discord.js';

export default {
  name: 'wikihow',
  description: 'Get a random WikiHow article',
  module: 'Fun',
  usage: 'wikihow',
  examples: ['wikihow'],
  run: async (tvf, msg) => {
    const article = await tvf.ksoft.images.wikihow();

    const embed = tvf.createEmbed({ thumbnail: false })
      .setAuthor(msg.author.tag, msg.author.avatarURL())
      .setTitle(`How to ${article.article.title}`)
      .setURL(article.article.link)
      .setImage(article.url);

    msg.channel.send(embed);
  },
} as Command;

export default {
  name: 'wikihow',
  description: 'Get a random WikiHow article',
  run: async (tvf, msg) => {
    const article = await tvf.ksoft.images.wikihow();

    const embed = tvf.createEmbed({ thumbnail: false, author: true }, msg)
      .setTitle(`How to ${article.article.title}`)
      .setURL(article.article.link)
      .setImage(article.url);

    msg.channel.send(embed);
  },
} as Command;

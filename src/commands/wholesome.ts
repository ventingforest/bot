export default {
  name: 'wholesome',
  description: 'Gets a random image from r/wholesome',
  module: 'Fun',
  run: async (tvf, msg) => {
    let img = await tvf.ksoft.images.reddit('wholesome', { removeNSFW: true, span: 'week' });

    do {
      img = await tvf.ksoft.images.reddit('wholesome', { removeNSFW: true, span: 'week' });
    } while (!(/.jpg|.jpeg|.png|.webp|.gif/.test(img.url)));

    const embed = tvf.createEmbed({ thumbnail: false, author: true }, msg)
      .setTitle(img.post.title)
      .setURL(img.post.link)
      .setImage(img.url);

    msg.channel.send(embed);
  }
} as Command;

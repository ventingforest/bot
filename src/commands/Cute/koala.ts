import axios from 'axios';
import * as _ from 'lodash';

export default {
  name: 'cat',
  description: 'Get a picture of a cat ^w^',
  aliases: ['catto', 'kitty'],
  run: async (tvf, msg) => {
    const fact = (await axios.get('https://some-random-api.ml/facts/koala')).data.fact;

    const embed = tvf.createEmbed({ author: true }, msg)
      .setTitle(':o 🐨')
      .setDescription(_.truncate(fact, { length: tvf.embedLimit.description }))
      .setImage((await axios.get('https://some-random-api.ml/img/koala')).data.link);

    msg.channel.send(embed);
  },
} as Command;

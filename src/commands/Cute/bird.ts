import axios from 'axios';
import * as _ from 'lodash';

export default {
  name: 'bird',
  description: 'Get a picture of a bird ^w^',
  aliases: ['birb'],
  run: async (tvf, msg) => {
    const fact = (await axios.get('https://some-random-api.ml/facts/bird')).data.fact;

    const embed = tvf.createEmbed({ author: true }, msg)
      .setTitle('Chirp! 🐦')
      .setDescription(_.truncate(fact, { length: tvf.embedLimit.description }))
      .setImage((await axios.get('https://some-random-api.ml/img/birb')).data.link);

    msg.channel.send(embed);
  },
} as Command;

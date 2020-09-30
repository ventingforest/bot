import axios from 'axios';
import * as _ from 'lodash';

export default {
  name: 'fox',
  description: 'Get a picture of a fox ^w^',
  aliases: ['foxo', 'foxy'],
  run: async (tvf, msg) => {
    const fact = (await axios.get('https://some-random-api.ml/facts/fox')).data.fact;

    const embed = tvf.createEmbed({ author: true }, msg)
      .setTitle('Yip! 🦊')
      .setDescription(_.truncate(fact, { length: tvf.embedLimit.description }))
      .setImage((await tvf.randomImage('fox', false)).url);

    msg.channel.send(embed);
  },
} as Command;

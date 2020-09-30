import axios from 'axios';
import * as _ from 'lodash';

export default {
  name: 'cat',
  description: 'Get a picture of a cat ^w^',
  aliases: ['catto', 'kitty'],
  run: async (tvf, msg) => {
    const fact = (await axios.get('https://some-random-api.ml/facts/cat')).data.fact;

    const embed = tvf.createEmbed({ author: true }, msg)
      .setTitle('Meow! 🐈')
      .setDescription(_.truncate(fact, { length: tvf.embedLimit.description }))
      .setImage((await tvf.randomImage('cat', false)).url);

    msg.channel.send(embed);
  },
} as Command;

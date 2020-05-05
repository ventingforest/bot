import axios from 'axios';
import * as _ from 'lodash';

export default {
  name: 'dog',
  description: 'Get a picture of a dog ^w^',
  module: 'Core',
  aliases: ['doggo', 'puppy', 'pupper'],
  run: async (tvf, msg) => {
    const fact = (await axios.get('https://some-random-api.ml/facts/dog')).data.fact;

    const embed = tvf.createEmbed({ author: true }, msg)
      .setTitle('Woof! 🐶')
      .setDescription(_.truncate(fact, { length: tvf.embedLimit.description }))
      .setImage((await tvf.randomImage('dog', false)).url);

    msg.channel.send(embed);
  },
} as Command;

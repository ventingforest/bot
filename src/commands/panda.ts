import axios from 'axios';
import * as _ from 'lodash';

export default {
  name: 'panda',
  description: 'Get a picture of a panda ^w^',
  module: 'Core',
  run: async (tvf, msg) => {
    const fact = (await axios.get('https://some-random-api.ml/facts/panda')).data.fact;
    const isRed = !(Math.floor(Math.random() * 2) === 0);

    let image = isRed ? (await axios.get('https://some-random-api.ml/img/panda')).data.link : (await axios.get('https://some-random-api.ml/img/red_panda')).data.link;
    do {
      image = isRed ? (await axios.get('https://some-random-api.ml/img/panda')).data.link : (await axios.get('https://some-random-api.ml/img/red_panda')).data.link;
    } while (!(/.jpg|.jpeg|.png|.webp/.test(image)))

    const embed = tvf.createEmbed({ author: true }, msg)
      .setTitle('Huff! 🐼')
      .setDescription(_.truncate(fact, { length: tvf.embedLimit.description }))
      .setImage(image);

    msg.channel.send(embed);
  },
} as Command;

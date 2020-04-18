export default {
  name: 'pda',
  description: 'Allows you to opt out of PDA related features.',
  module: 'Core',
  usage: 'pda',
  examples: ['pda'],
  run: async (tvf, msg) => {
    // get the author's document
    const doc = await tvf.userDoc(msg.author.id);

    // toggle PDA
    doc.pda = !doc.pda;
    tvf.saveDoc(doc);

    // inform the user of the change
    if (doc.pda) {
      msg.channel.send(`**${tvf.emojis.confetti}  |**  You have been opted back into all PDA related features.`);
    } else {
      msg.channel.send(`**${tvf.emojis.confetti}  |**  You have been opted out of all PDA related features - including hugging, kissing, and compliments.`);
    }
  }
} as Command;

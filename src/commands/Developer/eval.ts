import * as util from 'util';

export default {
  name: 'eval',
  description: 'Allows newt to run code without editing the bot!',
  args: true,
  usage: '<code>',
  allowGeneral: true,
  run: (tvf, msg, args) => {
    try {
      // get the code
      const code = args.join(' ');

      // allow referencing of the client
      // @ts-ignore
      if (code.includes('tvf')) code.replace('tvf', tvf);

      // allow referencing of the guild
      // @ts-ignore
      if (code.includes('guild')) code.replace('guild', msg.guild);

      // evaluate the code
      let evaled = eval(code);

      // make sure the evaluated code is in a string
      if (typeof evaled === 'string') {
        evaled = util.inspect(evaled);
      }

      // send a cleaned version of the result
      if (evaled) msg.channel.send(`**${tvf.emojis.confetti}  |** \`SUCCESS\`\n\`\`\`${clean(evaled)}\`\`\``);
      else msg.channel.send(`**${tvf.emojis.confetti}  |** \`SUCCESS\``);
    } catch (error) {
      tvf.logger.error(`Eval: ${error}`);
      msg.channel.send(`**${tvf.emojis.cross}  |**  \`ERROR\`\n\`\`\`${clean(error)}\`\`\``);
    }
  }
} as Command;

const clean = (txt: string) => typeof txt === 'string' ? txt.replace(/`/g, `\`${String.fromCharCode(8203)}`) : txt;
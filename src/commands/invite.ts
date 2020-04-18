export default {
  name: 'invite',
  description: 'Get an invite to the server.',
  module: 'Core',
  aliases: ['inv'],
  run: async (tvf, msg) => msg.channel.send(tvf.invite),
} as Command;

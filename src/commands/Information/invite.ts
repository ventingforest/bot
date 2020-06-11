export default {
  name: 'invite',
  description: 'Get an invite to the server.',
  aliases: ['inv'],
  allowGeneral: true,
  run: async (tvf, msg) => msg.channel.send(tvf.invite),
} as Command;

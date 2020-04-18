export default {
  name: 'say',
  module: 'Admin',
  usage: '<text>',
  allowGeneral: true,
  run: async (_tvf, msg, args) => await msg.delete() && msg.channel.send(args.join(' '))
} as Command;

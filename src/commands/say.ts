export default {
  name: 'say',
  module: 'Admin',
  usage: 'say <text>',
  examples: ['say hi'],
  allowGeneral: true,
  run: async (_tvf, msg, args) => await msg.delete() && msg.channel.send(args.join(' '))
} as Command;

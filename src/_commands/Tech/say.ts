export default {
  name: 'say',
  usage: '<text>',
  allowGeneral: true,
  staffAccess: ['Admin'],
  run: async (_tvf, msg, args) => await msg.delete() && msg.channel.send(args.join(' '))
} as Command;

export default {
  name: 'appeal',
  description: 'Get the link for TVF\'s ban appeal form.',
  run: async (tvf, msg) => msg.channel.send(tvf.banAppeal),
} as Command;

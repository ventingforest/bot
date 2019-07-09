/*
.......##.......##....########..####.##....##..######..
......##.......##.....##.....##..##..###...##.##....##.
.....##.......##......##.....##..##..####..##.##.......
....##.......##.......########...##..##.##.##.##...####
...##.......##........##.........##..##..####.##....##.
..##.......##.........##.........##..##...###.##....##.
.##.......##..........##........####.##....##..######..
*/
export const command: Command = {
    run: async (_client, msg) => !msg.mentions.members.first() ? msg.reply('you need to tag someone to hug 🤗') : await msg.delete() && msg.channel.send(`${msg.author} hugged ${msg.mentions.members.first()} 🤗💞`),
    config: {
        name: 'hug',
        args: true,
        usage: '<@user>',
        description: 'Hug another user in the server.'
    }
}
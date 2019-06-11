import { Command } from '../interfaces';

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
    run: (client, msg) => msg.reply('pong!'),
    config: {
        name: 'ping',
        description: 'Check if I\'m still alive <3'
    }
}
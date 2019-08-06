import axios from 'axios';
import * as dayjs from 'dayjs';
import * as ms from 'ms';

const format = (timestamp: number): string =>
    dayjs.unix(timestamp).format('H:mm A');

const timezone: Command = {
    run: (client, msg, args) => {
        if (args[1] === undefined) {
            const zone = args[0].toUpperCase();

            axios
                .get(
                    `http://api.timezonedb.com/v2.1/get-time-zone?key=${client.config.auth.timezone}&format=json&by=zone&zone=${zone}`
                )
                .then(({ data }) => {
                    if (data.status === 'FAILED') {
                        return msg.reply(
                            `timezone could not be found - reason: \`${data.message}\``
                        );
                    }

                    const embed = client
                        .createEmbed('random', false)
                        .setTitle(data.abbreviation)
                        .addField('Time', format(data.timestamp), true)
                        .addField('Formatted', data.formatted, true)
                        .addField('UNIX Timestamp', data.timestamp, true);

                    return msg.channel.send(embed);
                });
        } else {
            const from = args[0].toUpperCase();
            const to = args[1].toUpperCase();

            axios
                .get(
                    `http://api.timezonedb.com/v2.1/convert-time-zone?key=${client.config.auth.timezone}&format=json&from=${from}&to=${to}`
                )
                .then(({ data }) => {
                    if (data.status === 'FAILED') {
                        return msg.reply(
                            `conversion failed - reason: \`${data.message}\``
                        );
                    }

                    const embed = client
                        .createEmbed('random', false)
                        .setTitle('Timezone conversion')
                        .setDescription(`From ${from} to ${to}.`)
                        .addField(
                            `Time in ${from}`,
                            format(data.fromTimestamp),
                            true
                        )
                        .addField(
                            `Time in ${to}`,
                            format(data.toTimestamp),
                            true
                        )
                        .addField(
                            'Time difference',
                            ms(data.offset * 1000, { long: true }),
                            true
                        );

                    return msg.channel.send(embed);
                });
        }
    },
    config: {
        name: 'timezone',
        description:
            'Allows you to view the time in a certain timezone, or convert between them.',
        module: 'Core',
        args: true,
        usage: '**TZ1** *TZ2*',
    },
};

export default timezone;

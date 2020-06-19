import covid from 'novelcovid';
import { CanvasRenderService } from 'chartjs-node-canvas';
import imgurUploader from 'imgur-uploader';

export default {
	name: 'coronavirus',
	description: 'Returns data about the COVID19 crisis.',
    usage: 'coronavirus [country]',
    aliases: ['covid', 'covid19', 'virus'],
	examples: [
        'coronavirus', 
        'coronavirus world', 
        'coronavirus uk',
        'covid',
        'covid uk',
        'covid19',
        'covid19 uk',
        'virus',
        'virus uk'
    ],
	run: async (tvf, msg, args) => {
        const country = args.join(' ').toLowerCase();
        var currentData, historicalData;
        const embed = await tvf.createEmbed({ colour: tvf.colours.coronavirus, timestamp: true });
        embed.setDescription(`React with ${tvf.emojis.graph} for a chart!`)

        // fetch the data
        if (!country || country === 'world') {
            currentData = await covid.all();
            historicalData = await covid.historical.all();

            // populate the embed with data!
            embed
                .setTitle(`Coronavirus (COVID-19) Cases`)
                .addFields([
                    {
                        name: 'Confirmed',
                        value: `**${tvf.formatNumber(currentData.cases)}** ${currentData.todayCases > 0 ? `(+${tvf.formatNumber(currentData.todayCases)})` : ''}`,
                        inline: true,
                    },
                    {
                        name: 'Deaths',
                        value: `**${tvf.formatNumber(currentData.deaths)}** ${currentData.todayDeath > 0 ? `(+${tvf.formatNumber(currentData.todayDeaths)})` : ''}`,
                        inline: true,
                    },
                    {
                        name: 'Recovered',
                        value: `**${tvf.formatNumber(currentData.recovered)}** ${currentData.todayCases > 0 ? `(+${tvf.formatNumber(currentData.todayRecovered)})` : ''}`,
                        inline: true,
                    },
                    {
                        name: 'Active',
                        value: `**${tvf.formatNumber(currentData.active)}**`,
                        inline: true,
                    },
                    {
                        name: 'Critical',
                        value: `**${tvf.formatNumber(currentData.critical)}**`,
                        inline: true,
                    }
                ])
        }
        else {
            // @ts-ignore
            currentData = await covid.countries({ country });
            // @ts-ignore
            historicalData = await covid.historical.countries({ country });
            historicalData = historicalData.timeline;

            // if the country was not found, cancel the command
            if (currentData.message && currentData.message === 'Country not found or doesn\'t have any cases') {
                return msg.channel.send(`**${tvf.emojis.cross}  |**  \`${country}\` could not be found, or it doesn't have any cases!`);
            }

            // populate the embed with data!
            embed
                .setTitle(`Coronavirus (COVID-19) Cases | ${currentData.country}`)
                .setThumbnail(currentData.countryInfo.flag)
                .addFields([
                    {
                        name: 'Confirmed',
                        value: `**${tvf.formatNumber(currentData.cases)}** ${currentData.todayCases > 0 ? `(+${tvf.formatNumber(currentData.todayCases)})` : ''}`,
                        inline: true,
                    },
                    {
                        name: 'Deaths',
                        value: `**${tvf.formatNumber(currentData.deaths)}** ${currentData.todayDeath > 0 ? `(+${tvf.formatNumber(currentData.todayDeaths)})` : ''}`,
                        inline: true,
                    },
                    {
                        name: 'Recovered',
                        value: `**${tvf.formatNumber(currentData.recovered)}** ${currentData.todayCases > 0 ? `(+${tvf.formatNumber(currentData.todayRecovered)})` : ''}`,
                        inline: true,
                    },
                    {
                        name: 'Active',
                        value: `**${tvf.formatNumber(currentData.active)}**`,
                        inline: true,
                    },
                    {
                        name: 'Critical',
                        value: `**${tvf.formatNumber(currentData.critical)}**`,
                        inline: true,
                    },
                    {
                        name: 'Tests',
                        value: `**${tvf.formatNumber(currentData.tests)}** (${tvf.formatNumber(currentData.testsPerOneMillion)} per million)`,
                        inline: true,
                    }
                ]);
        }

        const embedMessage = await msg.channel.send(embed);
        await embedMessage.react(tvf.emojis.graph);

        embedMessage.awaitReactions((r, u) => [tvf.emojis.graph].includes(r.emoji.name) && u.id === msg.author.id, { max: 1 })
            .then(async collected => {
                await embedMessage.reactions.removeAll();
                const r = collected.first();
                const chart = new CanvasRenderService(960, 720);
                const image = chart.renderToBufferSync({
                    type: 'line',
                    data: {
                        labels: Object.keys(historicalData.cases),
                        datasets: [
                            {
                                label: 'Confirmed',
                                backgroundColor: tvf.colours.coronavirusChart.confirmed,
                                borderColor: tvf.colours.coronavirusChart.confirmed,
                                data: Object.values(historicalData.cases),
                                fill: false,
                            },
                            {
                                label: 'Recovered',
                                backgroundColor: tvf.colours.coronavirusChart.recovered,
                                borderColor: tvf.colours.coronavirusChart.recovered,
                                data: Object.values(historicalData.recovered),
                                fill: false,
                            },
                            {
                                label: 'Deaths',
                                backgroundColor: tvf.colours.coronavirusChart.deaths,
                                borderColor: tvf.colours.coronavirusChart.deaths,
                                data: Object.values(historicalData.deaths),
                                fill: false,
                            },
                        ],
                        options: {
                            title: {
                                display: true,
                                text: 'Linear Graph'
                            },
                        },
                    },
                },'image/png');

                // upload the chart to imgur, and add it to the embed
                await imgurUploader(image, { title: `Coronavirus ${new Date().toString()}`})
                .then(data => embed.setImage(data.link));
                await embedMessage.edit(embed);
            });
    },
} as Command;

async function reminder(client, guildID, channelID) {
	let guild = client.guilds.cache.get(guildID);

	setInterval(function() {
		let time = new Date();
		let numday = time.getDay();
		let hour = time.getHours();
		
		const reminderEmbed = new Discord.MessageEmbed()
			.setColor('#569187');

		if(guild && guild.channels.cache.get(channelID)) {

			let day = sched.numToDay[numday];
			let idx;
			for (let i = 0; i < sched[day].length; i++) {
				if (sched[day][i].startTime <= hour && hour < sched[day][i].endTime) {
					idx = i;
					break;
				}
			}
			reminderEmbed.setTitle(`Absen for ${sched[day][idx].code} - ${sched[day][idx].subj}`)
			reminderEmbed.setImage('https://tenor.com/view/yorimoi-sora-yori-kimari-eyes-smile-gif-16312918')

			guild.channels.cache.get(channelID).send({content: `<@${userID}>`, embeds: [reminderEmbed]});
			
		}
	}, 1000 * 60 * 40)
}
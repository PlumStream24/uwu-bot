const Discord = require('discord.js');
const sched = require('./sched.json');
const {prefix, token, userID, guildID, channelID, danbooruAPI} = require('./config.json');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
let reminderOn = false;

/* Retired commands
const Danbooru = require('danbooru');
*/

client.once('ready', () => {
	console.log('Ready!');
});


client.on('messageCreate', message => {
	if (message.author.bot) return;

	//set status
	if (message.content.startsWith(`${prefix}status`)) {
		if (message.author.id != userID) return;
		
		const msg = message.content.split(' ');
		
		const status = ['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING']

		if (!status.includes(msg[1].toUpperCase())) return;

		client.user.setActivity(msg.slice(2,).join(' '), {type : msg[1].toUpperCase()});
	}

	// hello
	if(message.content.toLowerCase() === `hello bot` || message.content.toLowerCase() === `hi bot`) 
    {
		if (Math.random() < 0.5) {
        	message.channel.send('Hewwo!');
		} else {
			message.channel.send('Hi!');
		}
    }

	// help
	if (message.content.startsWith('!help')) {
		let helpEmbed = new Discord.MessageEmbed()
			.setTitle('Command List')
			.setAuthor({name : client.user.username, iconURL : client.user.avatarURL()})
			.setColor('#569187')
			.setDescription('\u200B')
			.addFields(
				{ name: '• Hi bot or Hello bot', value: 'Returns `Hi!` or `Hewwo!`'},
				{ name: '• !ping `<user mention>` `<interval>` `<count>`', value: 'Ping the mentioned user every `<interval>` minutes for `<count>` times'},
				{ name: '• !stop', value: 'Stop ping spam'},
				{ name: '• !RemindMe `<time>` `<message>`', value: 'Remind the message author in `<time>` minutes'},
				{ name: '• !uwu `<message>`', value: 'Will uwu-fy the message'},
			)
			.addField('\u200b','\u200b');
		
		client.users.fetch(userID).then(user => {
			helpEmbed.setFooter({ text : 'Made by PlumStream24', iconURL : user.avatarURL()});
			message.channel.send({embeds : [helpEmbed]});
		});
	}

	// Remind Me Command
	if (message.content.startsWith(`${prefix}RemindMe`)) {
		const author = message.author.id;
		const spltMsg = message.content.split(' ');

		let minutes = spltMsg[1];
		let msg = spltMsg.slice(2,).join(' ');

		if (isNaN(minutes)) return message.channel.send("Invalid command.");
		if (minutes == undefined || minutes < 1) {
			minutes = 1;
		}

		message.channel.send(`Reminder set in ${minutes} minute${(minutes===1?'':'s')}`);
		setTimeout(function() {
			message.channel.send(`<@!${author}> ${msg}`);
		}, 1000 * 60 * minutes);
	}

	// uwu-fy message
	if (message.content.startsWith(`${prefix}uwu`)) {
        String.prototype.replaceAll = function(search, replace) {
            return this.split(search).join(replace);
        }

        let msg = message.content
            .slice(4, message.content.length)
            .replaceAll('l', 'w')
            .replaceAll('r', 'w')
            .replaceAll('b', 'bw')
            .replaceAll('ou', 'uw')
            .replaceAll('th', 'd')
            .replaceAll('what', 'wut')
            .replaceAll('v', 'vw')
			.replaceAll('do', 'dew')
			.replaceAll('me', 'mwe')

        message.channel.send(`${msg} UwU`);
    }
})

// ping spam
let interval = null;
const userPattern = /^(<@!)(\d+)(>)$/;
client.on('messageCreate', message => 
{
	if (message.author.bot) return;

	if (message.content.startsWith(`${prefix}ping`)) {
		const spltMsg = message.content.split(' ');
		const user = spltMsg[1];
		let minutes = spltMsg[2];
		let num = spltMsg[3];
		if (!userPattern.test(user)) return message.channel.send("Invalid command.");
		
		if (minutes < 1 || minutes == undefined || isNaN(minutes)) {
			minutes = 1;
		}
		if (num < 1 || num == undefined || isNaN(num)) {
			num = 1;
		}

		if (message.author.id == userID) {
			if (interval == null) {
				let count = 0;
				interval = setInterval(function() {
					message.channel.send(`${user}`);
					count++;
					if (count >= num)
					{
						clearInterval(interval);
						interval = null;
					}
				}, 1000 * 60 * minutes);

				message.channel.send(`Pinging ${user} every ${minutes} minute${(minutes===1?'':'s')} for ${num} time${(num===1?'':'s')}.`);
			} else {
				message.channel.send('I can only ping one at a time.');
			}
		} else {
			message.channel.send('You lack the privilege.');
		}
	}

	if (message.content.startsWith(`${prefix}stop`)) {
		if (interval != null) {
			clearInterval(interval);
			interval = null;
			message.channel.send('Stopping...');
		} else {
			message.channel.send("I'm not doing anything...");
		}
	}
	
})


// Reminder
client.on('ready', () => {
	let guild = client.guilds.cache.get(guildID);
	if (!reminderOn) return;

	setInterval(function() {
		let time = new Date();
		time.setTime(time.getTime() + (7*60*60*1000))
		let numday = time.getDay();
		let hour = time.getHours();
		let ran_num = Math.floor(Math.random() * 10) + 1;
		const reminderEmbed = new Discord.MessageEmbed()
			.setColor('#569187');

		if(guild && guild.channels.cache.get(channelID)) {

			let day = sched.numToDay[numday];
			let idx;
			for (let i = 0; i < sched[day].length; i++) {
				if (sched[day][i].startTime <= hour && hour < sched[day][i].endTime) {
					idx = i;
					break;
				} else {
					idx = null;
				}
			}
			if (idx != null) {
				reminderEmbed.setTitle(`Absen for ${sched[day][idx].code} - ${sched[day][idx].subj}`)
				reminderEmbed.setImage('https://tenor.com/view/yorimoi-sora-yori-kimari-eyes-smile-gif-16312918')
				
				guild.channels.cache.get(channelID).send({content: `<@${userID}>`, embeds: [reminderEmbed]});
			}
			
		}
	}, 1000 * 60 * 50)
})

// Remove this later
client.on('ready', () => {
	let guild = client.guilds.cache.get(guildID);
	guild.channels.cache.get('601751285896708096').send({content: `Reminder that sul hasn't paid me back for MoM ticket`})
})

// danbooru command *retired*
/*
async function BooruRequest(message) {
	const booru = new Danbooru();
	const posts = await booru.posts({tags: 'order:rank', limit:100});
	const index = Math.floor(Math.random() * posts.length)
	const post = posts[index]
	const booruEmbed = new Discord.MessageEmbed()
		.setTitle("Booru!")
		.setImage(`${post.file_url}`)
		.setColor('0e733b');
	message.channel.send(booruEmbed);
	//message.channel.send(posts.length);
}

client.on('messageCreate', message => {
	if (message.author.bot) return;

	if (message.content.startsWith(`${prefix}booru`)) {
		BooruRequest(message);
	}
})
*/

client.login(process.env.token);
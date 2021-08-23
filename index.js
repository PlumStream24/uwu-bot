const fs = require('fs')
const Discord = require('discord.js');
const sched = require('./sched.json');
const {prefix, token, userID, guildID, channelID, YouTubeAPIKey, danbooruAPI} = require('./config.json');
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

/* Retired commands
const Danbooru = require('danbooru');
const ytdl = require('ytdl-core');
const queue = new Map();
const YouTubeAPI = require('simple-youtube-api');
const youtube = new YouTubeAPI(YouTubeAPIKey);
*/

client.once('ready', () => {
	console.log('Ready!');
	client.user.setActivity('Evangelion 3.0+1.0',{type : 'WATCHING'});
});

// Hi!
client.on('messageCreate', message => 
{
    if(message.content.toLowerCase() === `hello bot` || message.content.toLowerCase() === `hi bot`) 
    {
		if (Math.random() < 0.5) {
        	message.channel.send('Hewwo!');
		} else {
			message.channel.send('Hi!');
		}
    }
})

// help
client.on('messageCreate', message => {
	if (message.author.bot) return;

	if (message.content.startsWith('!help')) {
		let helpEmbed = new Discord.MessageEmbed()
			.setTitle('Command List')
			.setAuthor(client.user.username, client.user.avatarURL())
			.setColor('#569187')
			.setDescription('\u200B')
			.addFields(
				{ name: '• Hi bot or Hello bot', value: 'Returns `Hi!` or `Hewwo!`'},
				{ name: '• !ping `<user mention>` `<interval>` `<count>`', value: 'Ping the mentioned user every `<interval>` minutes for `<count>` times'},
				{ name: '• !stop', value: 'Stop ping spam'},
				{ name: '• !RemindMe `<time>` `<message>`', value: 'Remind the message author in `<time>` minutes'},
				{ name: '• !uwu `<message>`', value: 'Will uwu-fy the message'},
				{ name: '• !helltaker', value: 'Returns a random helltaker art'}
			);
		
		client.users.fetch(userID).then(user => {
			helpEmbed.setFooter('Made by PlumStream24', `${user.avatarURL()}`);
			message.channel.send(helpEmbed);
		});
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

// remindme command
client.on('messageCreate', message => {
	if (message.author.bot) return;
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
})


// uwu-fy message
client.on('messageCreate', message => {
    if (message.author.bot) return;
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

// Reminder
client.on('ready', () => {
	let guild = client.guilds.cache.get(guildID);

	setInterval(function() {
		let time = new Date();
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
				}
			}
			reminderEmbed.setTitle(`Absen for ${sched[day][idx].code} - ${sched[day][idx].subj}`)
			guild.channels.cache.get(channelID).send({content: `<@${userID}>`, embeds: [reminderEmbed]});
			
		}
	}, 1000 * 60 * 1)
})


// kill command
client.on('messageCreate', message => {
	if (message.author.bot) return;
	
	if (message.content.toLowerCase().split(' ').includes('kill')) {
		
		const killEmbed = new Discord.MessageEmbed()
		.setTitle(`*B A N G*`)
		.setDescription(`<@${message.author.id}>`)
		.setImage('https://cdn.discordapp.com/attachments/738539670853648404/740965770846273626/maxresdefault.png')
		.setFooter('*dies*')
		.setColor('#FF0505');
		
		const id = message.content.split(' ').indexOf('kill') + 1;
		
		if (message.mentions.users.first()) killEmbed.setDescription(message.mentions.users.first());
		else if (message.mentions.roles.first()) killEmbed.setDescription(message.mentions.roles.first());
		else if (message.mentions.everyone) killEmbed.setDescription('@everyone');
		
		return message.channel.send(killEmbed);
	}
	
})

// dad command *deactivated*
/*
client.on('messageCreate', message =>
{
	if (message.author.bot) return;
	if (message.content.toLowerCase().includes("i'm")) {
		let id = message.content.toLocaleLowerCase().indexOf(`i'm`) + 4;
		let hi = message.content.slice(id,message.content.length);
		if (hi.toLocaleLowerCase() == 'bot') {
			message.channel.send(`You're not bot, I'm bot`);
		} else {
			if (hi) {
				message.channel.send(`Hi ${hi}, I'm bot`);
			}
		}
	}
}
)
*/

// helltaker command
client.on('messageCreate', message =>
{
	if (message.author.bot) return;
	
	if (message.content == `${prefix}helltaker`) {
		if (message.channel.nsfw != true) {
			return message.channel.send('Go to horny jail! *bonk*');
		}
		
		let ran_num = Math.floor(Math.random() * 123) + 1;
		const helltakerEmbed = new Discord.MessageEmbed()
		.setColor('#ff0505')
		.setDescription(`UwU ${message.author} is horny!`)
		.attachFiles([`./helltaker/${ran_num}.jpg`])
		.setImage(`attachment://${ran_num}.jpg`);
		
		message.channel.send(helltakerEmbed);
	}
}
)

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

//  Retired music command because I couldn't keep it up
/*
// music command
client.on('messageCreate', message => 
    {
        if (message.author.bot) return;
        if (!message.content.startsWith(prefix)) return;

		const serverQueue = queue.get(message.guild.id);

		switch (message.content.split(' ')[0]) {
			case `${prefix}play` :
				execute(message, serverQueue);
				return;
			case `${prefix}stop` :
				stop(message, serverQueue);
				return;
			case `${prefix}skip` :
				skip(message, serverQueue);
				return;
			case `${prefix}pause` :
				pause(message, serverQueue);
				return;
			case `${prefix}resume` :
				resume(message, serverQueue);
				return;
			case `${prefix}nowplaying` || `${prefix}np`:
				nowplaying(message, serverQueue);
				return;
			case `${prefix}queue` :
				listQueue(message, serverQueue);
				return;
			case `${prefix}remove` :
				remove(message, serverQueue);
				return;
			case `${prefix}playlist` :
				executePlaylist(message, serverQueue);
				return;
		}

})
*/

async function executePlaylist(message, serverQueue) {
	const args = message.content;

	const voiceChannel = message.member.voice.channel;
	if (!voiceChannel) return message.channel.send('You need to be in a voice channel to play music!');
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return message.channel.send('I need the permissions to join and speak in your voice channel!');
	}
	if (!args.split(' ')[1]) return message.channel.send('Usage : !play <video title / URL>');
	
	
	const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
	const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;
	//if (videoPattern.test(args.slice(10,args.length))) return message.channel.send('Use !play to queue a song!');
	
	let song = [];
	let playlist = null;
	let videos = [];

	//if (!playlistPattern.test(args.slice(10,args.length))) return message.channel.send('Playlist not found');

	try {
		playlist = await youtube.getPlaylist(args.slice(10,args.length));
		videos = await playlist.getVideos();
	} catch (error) {
		console.error(error);
		return message.reply("Playlist not found :(").catch(console.error);
	}

	for (let index = 0; index < videos.length; index++) {
        let songInfo = await ytdl.getInfo(videos[index].url);
        song.push({
            title: videos[index].title,
            url: videos[index].url,
            duration : songInfo.videoDetails.lengthSeconds,
			thumbnail : videos[index].thumbnails.default.url,
			user : message.author
        });
    }

	if (!serverQueue) {
		const queueContruct = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true,
		};

		queue.set(message.guild.id, queueContruct);

		queueContruct.songs = queueContruct.songs.concat(song);

		try {
			var connection = await voiceChannel.join();
			queueContruct.connection = connection;
			play(message.guild, queueContruct.songs[0]);
		} catch (err) {
			console.log(err);
			queue.delete(message.guild.id);
			return message.channel.send(err);
		}

		const addPlaylist = new Discord.MessageEmbed()
		.setAuthor(`${message.author.username}`, `${message.author.avatarURL()}`)
		.setColor('#F8AA2A')
		.setTitle('Queued')
		.setDescription(`${queueContruct.songs.length} songs from [${playlist.title}](${playlist.url}) playlist`)
		.setThumbnail(`${playlist.thumbnails.default.url}`)
		
		return message.channel.send(addPlaylist);
	
	} else {
		serverQueue.songs = serverQueue.songs.concat(song);
		const addPlaylist = new Discord.MessageEmbed()
		.setAuthor(`${message.author.username}`, `${message.author.avatarURL()}`)
		.setColor('#F8AA2A')
		.setTitle('Queued')
		.setDescription(`${serverQueue.songs.length} songs from [${playlist.title}](${playlist.url}) playlist`)
		.setThumbnail(`${playlist.thumbnails.default.url}`)
		
		return message.channel.send(addPlaylist);
	}
}


async function execute(message, serverQueue) {
	const args = message.content;

	const voiceChannel = message.member.voice.channel;
	if (!voiceChannel) return message.channel.send('You need to be in a voice channel to play music!');
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return message.channel.send('I need the permissions to join and speak in your voice channel!');
	}
	if (!args.split(' ')[1]) return message.channel.send('Usage : !play <video title / URL>');
	
	const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
	const playlistPattern = /^.*(list=)([^#\&\?]*).*/gi;
	if (playlistPattern.test(args.slice(6,args.length))) return message.channel.send('Use !playlist to queue a playlist!');
	let vidUrl;
		
	if (!videoPattern.test(args.slice(6,args.length))) {
		const result = await youtube.searchVideos(args.slice(6, args.length), 1);
		vidUrl = result[0].url;
	} else {
		vidUrl = args.slice(6,args.length);
	}

	const songInfo = await ytdl.getInfo(vidUrl);

	const song = {
		title: songInfo.videoDetails.title,
		url: songInfo.videoDetails.video_url,
		duration : songInfo.videoDetails.lengthSeconds,
		thumbnail : songInfo.videoDetails.thumbnail.thumbnails[0].url,
		user : message.author
	};

	if (!serverQueue) {
		const queueContruct = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true,
		};

		queue.set(message.guild.id, queueContruct);

		queueContruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueContruct.connection = connection;
			play(message.guild, queueContruct.songs[0]);
		} catch (err) {
			console.log(err);
			queue.delete(message.guild.id);
			return message.channel.send(err);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		const addSong = new Discord.MessageEmbed()
			.setAuthor(`${song.user.username}`, `${song.user.avatarURL()}`)
			.setColor('#F8AA2A')
			.setTitle('Queued')
			.setDescription(`[${song.title}](${song.url})\nQueued #${serverQueue.songs.length - 1}`)
			.setThumbnail(`${song.thumbnail}`)
			.setFooter(new Date(song.duration * 1000).toISOString().substr(11, 8));

		return message.channel.send(addSong);
	}

}

function skip(message, serverQueue) {
	if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to stop the music!');
	if (!serverQueue) return message.channel.send('There is no song that I could skip!');
	message.channel.send(`${message.author} skipped the music!`);
	serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
	if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to stop the music!');
	if (!serverQueue) return message.channel.send('There is nothing playing');
	message.channel.send(`${message.author} stopped the music!`);
	serverQueue.songs = [];
	serverQueue.connection.dispatcher.end();
	
}

function pause(message, serverQueue) {
	if (!serverQueue) return message.reply("There is nothing playing").catch(console.error);
	if (serverQueue.playing) {
		serverQueue.playing = false;
		serverQueue.connection.dispatcher.pause(true);
		return serverQueue.textChannel.send(`${message.author} paused the music.`).catch(console.error);
	}
}

function resume(message, serverQueue) {
	if (!serverQueue) return message.reply("There is nothing playing").catch(console.error);
	if (!serverQueue.playing) {
		serverQueue.playing = true;
		serverQueue.connection.dispatcher.resume(true);
		return serverQueue.textChannel.send(`${message.author} resumed the music.`).catch(console.error);
	} else return serverQueue.textChannel.send("The queue is not paused").catch(console.error);
}

function nowplaying(message, serverQueue) {
	if (!serverQueue) return message.reply("There is nothing playing").catch(console.error);
	const song = serverQueue.songs[0];

	const nowPlayingEmbed = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setAuthor(`${song.user.username}`, `${song.user.avatarURL()}`)
		.setTitle(`Now Playing`)
		.setDescription(`[${song.title}](${song.url})`)
		.setThumbnail(`${song.thumbnail}`)
		.setFooter(new Date(song.duration * 1000).toISOString().substr(11, 8));

	return message.channel.send(nowPlayingEmbed);
}

function listQueue(message, serverQueue) {
	if (!serverQueue) return message.reply("There is nothing playing").catch(console.error);
	const description = serverQueue.songs.map((song, index) => {
		if (index == 0) {
			return `**Now playing** : ${song.title}`;
		} else {
			return `${index}. ${song.title}`;
		}
	});
	
	let queueEmbed = new Discord.MessageEmbed()
		.setAuthor(`${message.guild.name}`, `${message.guild.iconURL()}`)
		.setTitle('Music Queue')
		.setDescription(description)
		.setColor('#F8AA2A');
		
	if (!serverQueue.songs[1]) return message.channel.send(queueEmbed.setDescription([`**Now Playing** : ${serverQueue.songs[0].title}`, 'Queue is empty.']));
	message.channel.send(queueEmbed);
}

function remove(message, serverQueue) {
	if (!serverQueue) return message.channel.send("There is no queue.").catch(console.error);
	
	args = message.content.slice(8, message.content.length);

	if (!args.length || isNaN(args)) return message.reply(`Usage: ${prefix}remove <Queue Number>`);
	if (!Number.isInteger(parseInt(args))) return message.reply(`Usage: ${prefix}remove <Queue Number>`);
	if (args >= serverQueue.songs.length) return message.reply("Queue doesn't exist");

    const song = serverQueue.songs.splice(args[0], 1);
    message.channel.send(`${message.author} removed **${song[0].title}** from the queue.`);
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}

	const dispatcher = serverQueue.connection.play(ytdl(song.url))
		.on('finish', () => {
			console.log('Music ended!');
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => {
			console.error(error);
		});
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
		
	const nowPlayingEmbed = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setAuthor(`${song.user.username}`, `${song.user.avatarURL()}`)
		.setTitle(`Now Playing`)
		.setDescription(`[${song.title}](${song.url})`)
		.setThumbnail(`${song.thumbnail}`)
		.setFooter(new Date(song.duration * 1000).toISOString().substr(11, 8));

	serverQueue.textChannel.send(nowPlayingEmbed);
}

// End of retired music command

client.login(token);
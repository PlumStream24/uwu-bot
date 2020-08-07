const fs = require('fs')
const Discord = require('discord.js');
const {prefix, token, YouTubeAPIKey} = require('./config.json');
const client = new Discord.Client();
const ytdl = require('ytdl-core');
const queue = new Map();
const YouTubeAPI = require('simple-youtube-api');
const youtube = new YouTubeAPI(YouTubeAPIKey);


client.on('ready', () => {
	console.log('Ready!');
	client.user.setActivity('UwU',{type : 'LISTENING'});
});


client.on('message', message => 
{
    if(message.content === `${prefix}ping`) 
    {
        message.channel.send('Pong!');
    }
})

// uwu-fy message
client.on('message', message => {
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

// kill command
client.on('message', message => {
	if (message.author.bot) return;
	if (message.content.toLowerCase().includes('kill')) {
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
		else if (message.content.toLowerCase().split(' ')[id] === 'yourself') killEmbed.setImage('https://cdn.discordapp.com/attachments/738539670853648404/741185468644720690/shin-megami-tensei-persona-3-portable-wallpaper-preview.png');

		return message.channel.send(killEmbed);
	}
})

// dad command
client.on('message', message =>
    {
        if (message.author.bot) return;
        if (message.content.toLowerCase().includes("i'm")) {
            let id = message.content.toLocaleLowerCase().indexOf(`i'm`) + 4;
            let hi = message.content.slice(id,message.content.length);
            if (hi.toLocaleLowerCase() == 'dad') {
                message.channel.send(`You're not dad, I'm dad`);
            } else {
                message.channel.send(`Hi ${hi}, I'm dad`);
            }
        }
    }
)

// dame da ne command
client.on('message', message =>
{
	if (message.content.includes("dame")) {
		const pics = ['https://cdn.discordapp.com/attachments/738539670853648404/740207324357984386/EQwM36XUcAMeHDP.png', 
			'https://cdn.discordapp.com/attachments/738539670853648404/740165480047968337/FB_IMG_1596128965327.jpg'];
		
		message.channel.send(pics[Math.floor(Math.random() * 2)]);
	}
})


// helltaker command
client.on('message', message =>
	{
		if (message.author.bot) return;

		
		if (message.content == `${prefix}helltaker`) {

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


// music command
client.on('message', message => 
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


client.login(token);
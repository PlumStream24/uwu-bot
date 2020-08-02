const fs = require('fs')
const Discord = require('discord.js');
const {prefix, token, prefixm} = require('./config.json');
const client = new Discord.Client();
const ytdl = require('ytdl-core');
const queue = new Map();
const {getInfo} = require('ytdl-getinfo')

client.once('ready', () => {
    console.log('Ready!');
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
    else if (message.content.startsWith(`${prefix}uwu`)) {
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

        message.channel.send(`${msg} UwU`);
    }
})

// dad command
client.on('message', message =>
    {
        if (message.author.bot) return;
        if (message.content.includes(`i'm`)) {
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

// helltaker command
client.on('message', message =>
	{
		if (message.author.bot) return;

		let ran_num = Math.floor(Math.random() * 120) + 1;
		const helltakerEmbed = new Discord.MessageEmbed()
		.setColor('#ff0505')
		.setDescription(`${message.author} is horny!`)
		.attachFiles([`./helltaker/${ran_num}.jpg`])
		.setImage(`attachment://${ran_num}.jpg`);

		if (message.content == `${prefix}helltaker`) {
			/*message.channel.send(`Enjoy`, {
				files: [`./helltaker/${ran_num}.jpg`]
			});*/
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
        if (message.content.startsWith(`${prefix}play`)) {
            execute(message, serverQueue);
            return;
    	} else if (message.content.startsWith(`${prefix}skip`)) {
            skip(message, serverQueue);
            return;
        } else if (message.content.startsWith(`${prefix}stop`)) {
            stop(message, serverQueue);
			return;
		}
})

async function execute(message, serverQueue) {
	const args = message.content.split(' ');

	const voiceChannel = message.member.voice.channel;
	if (!voiceChannel) return message.channel.send('You need to be in a voice channel to play music!');
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return message.channel.send('I need the permissions to join and speak in your voice channel!');
	}
	if (!args[1]) {
		return message.channel.send('Please add url!');
	}
    const songInfo = await ytdl.getInfo(args[1])
    
    const song = {
		title: songInfo.videoDetails.title,
		url: songInfo.videoDetails.video_url
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
		return message.channel.send(`${song.title} has been added to the queue!`);
	}

}

function skip(message, serverQueue) {
	if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to stop the music!');
	if (!serverQueue) return message.channel.send('There is no song that I could skip!');
	serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
	if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to stop the music!');
	serverQueue.songs = [];
	serverQueue.connection.dispatcher.end();
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
}


client.login(token);
async function remindme(message) {
	
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
function setStatus(client, message) {
    if (message.author.id != userID) return;

    const msg = message.content.split(' ');
    const status = ['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING', 'COMPETING',]
    if (!status.includes(msg[1].toUpperCase())) return;

    client.user.setActivity(msg.slice(2,).join(' '), {type : msg[1].toUpperCase()});
}
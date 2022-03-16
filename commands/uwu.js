function uwu(message) {
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
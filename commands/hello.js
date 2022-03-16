function hello(message) {
    if (Math.random() < 0.5) {
        message.channel.send('Hewwo!');
    } else {
        message.channel.send('Hi!');
    }
}
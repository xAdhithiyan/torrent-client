import dgram from 'dgram';

const message = Buffer.from('cba');

const client = dgram.createSocket('udp4');

client.connect(41234, 'localhost', (err) => {
  console.log('connected');
  client.send(message, (err) => {
    console.log('message sent');
  });

  client.close();
});

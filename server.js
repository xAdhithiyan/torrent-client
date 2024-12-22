import dgram from 'dgram';

const server = dgram.createSocket('udp4');

server.on('message', (msg, rinfo) => {
  console.log(`MESSAGE: ${msg} | from ${rinfo.address}, ${rinfo.family}`);
});

server.on('error', (err) => {
  console.log(`ERROR: ${err}`);
});

server.on('listening', () => {
  console.log(
    `server listening on address: ${server.address().address} and port: ${server.address().port}`,
  );
});
server.bind({
  address: 'localhost',
  port: '41234',
});

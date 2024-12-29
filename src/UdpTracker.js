import dgram from 'dgram';
import url from 'url';
import crypto from 'crypto';
import { infoHash, torrentSize } from './torrentParser.js';
import generatePeerId from './util.js';

const UPDCONNECTIONID_1 = 0x417;
const UPDCONNECTIONID_2 = 0x27101980;
const PORT = 6681;

const getPeers = (torrent) => {
  const clientSocket = dgram.createSocket('udp4');

  const trackerUrl = url.parse(decodingTorrent(torrent.announce));

  sendRequest(clientSocket, connectionRequest(), trackerUrl);

  clientSocket.on('message', (res) => {
    if (res.readUint32BE(0) == 0) {
      console.log('connection response');

      const response = parseConnectionResponse(res);
      const announceReq = announceRequest(response.connectionId, torrent);
      sendRequest(clientSocket, announceReq, trackerUrl);
    } else if (res.readUint32BE(0) == 1) {
      console.log('announce response');
      const response = parseAnnounceResponse(res);
      console.log(response);
    }
  });
};

const sendRequest = (clientSocket, message, trackerUrl) => {
  clientSocket.send(message, trackerUrl.port, trackerUrl.hostname, (err) => {
    if (err) {
      console.log(`Error in Message Sending: ${err}`);
    } else {
      console.log('Message Sent');
    }
  });
};

const connectionRequest = () => {
  const msg = Buffer.alloc(16);

  msg.writeUInt32BE(UPDCONNECTIONID_1, 0); // in big endian the msb is at lowest memory address
  msg.writeUInt32BE(UPDCONNECTIONID_2, 4);

  msg.writeUint32BE(0, 8);

  crypto.randomBytes(4).copy(msg, 12);
  return msg;
};

const announceRequest = (connectionId, torrent) => {
  const msg = Buffer.alloc(98);

  connectionId.copy(msg, 0);
  msg.writeUInt32BE(1, 8);
  crypto.randomBytes(4).copy(msg, 12);
  infoHash(torrent).copy(msg, 16);
  generatePeerId().copy(msg, 36);
  Buffer.alloc(8).copy(msg, 56);
  torrentSize(torrent).copy(msg, 64);
  Buffer.alloc(8).copy(msg, 72);
  msg.writeUInt32BE(0, 80);
  msg.writeUInt32BE(0, 84);
  crypto.randomBytes(4).copy(msg, 88);
  msg.writeInt32BE(-1, 92);
  msg.writeUInt16BE(PORT, 96);

  return msg;
};

const parseConnectionResponse = (res) => {
  const obj = {
    action: res.readUint32BE(0),
    transicitionId: res.readUint32BE(4),
    connectionId: res.slice(8),
  };

  return obj;
};

const parseAnnounceResponse = (res) => {
  const gatherPeer = (totalArr, peerSize) => {
    let currSize = 0;
    let peers = [];

    while (currSize < totalArr.length) {
      const currPeer = totalArr.slice(currSize, currSize + peerSize);

      peers.push({
        ip: currPeer.slice(0, 4).join('.'),
        port: currPeer.readUint16BE(4),
      });
      currSize += peerSize;
    }
    return peers;
  };

  const obj = {
    action: res.readUint32BE(0),
    transictionId: res.readUint32BE(4),

    leeches: res.readUint32BE(12),
    seeders: res.readUint32BE(16),
    peers: gatherPeer(res.slice(20), 6),
  };

  return obj;
};

const decodingTorrent = (bufferData) =>
  new TextDecoder('utf-8').decode(bufferData);

export default getPeers;

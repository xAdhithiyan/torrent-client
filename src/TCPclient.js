import net from 'net';
import { Buffer } from 'buffer';
import buildMessage from './buildMessage.js';
import messageHandler from './messageHandlers.js';
import queueState from './queueState.js';

const download = (peer, torrent, pieces, file) => {
  const clientSocket = net.Socket();
  const queue = queueState(torrent);

  clientSocket.connect(peer.port, peer.ip, () => {
    //console.log('connected to TCP peer server');

    clientSocket.write(buildMessage.handshake(torrent));
  });

  wholeMessage(clientSocket, (msg) => {
    msgHandler(msg, clientSocket, queue, pieces, file, torrent);
  });

  clientSocket.on('error', (err) => {
    //console.log(err);
  });

  clientSocket.on('end', () => {
    //console.log('client disconnected');
  });
};

const wholeMessage = (clientSocket, callback) => {
  let totalMsg = Buffer.alloc(0);
  let handshake = true;

  clientSocket.on('data', (data) => {
    totalMsg = Buffer.concat([totalMsg, data]);

    if (totalMsg.length >= 1) {
      // handshake message is 49 + len(pstr) which is usally 49 + 19 = 68
      const msgLength = totalMsg.readUInt8(0) + 49;

      if (totalMsg.length >= msgLength && handshake) {
        const slicedMessage = totalMsg.slice(0, msgLength);

        callback(slicedMessage);
        handshake = false;
      } else if (!handshake) {
        callback(data);
      }
    }
  });
};

const msgHandler = (msg, clientSocket, queue, pieces, file, torrent) => {
  if (isHandshake(msg)) {
    console.log('handshake verified');
    clientSocket.write(buildMessage.intrested());
  } else {
    const parsedResponse = parseResponse(msg);
    switch (parsedResponse.id) {
      case 0:
        messageHandler.chokeHandler(clientSocket);
        break;
      case 1:
        messageHandler.unchokeHandler(clientSocket, pieces, queue);
        break;
      case 4:
        messageHandler.haveHandler(
          clientSocket,
          pieces,
          queue,
          parsedResponse.payload,
        );
        break;
      case 5:
        messageHandler.bitfieldHandler(
          clientSocket,
          pieces,
          queue,
          parsedResponse.payload,
        );
        break;
      case 7:
        messageHandler.peiceHandler(
          clientSocket,
          pieces,
          queue,
          parsedResponse.payload,
          file,
          torrent,
        );
        break;
      default:
      //console.log('default');
    }
  }
};

const isHandshake = (msg) =>
  msg.length == msg.readUint8(0) + 49 &&
  msg.toString('utf8', 1, 20) == 'BitTorrent protocol';

const parseResponse = (msg) => {
  const size = msg.length > 3 ? msg.readInt32BE(0) : null;
  const id = msg.length > 4 ? msg.readUInt8(4) : null;
  let payload = msg.length > 5 ? msg.slice(5) : null;

  if (id == 6 || id == 7 || id == 8) {
    const rest = payload.slice(8);
    payload = {
      index: payload.readInt32BE(0),
      begin: payload.readInt32BE(4),
    };
    payload[id == 7 ? 'block' : 'length'] = rest;
  }

  return {
    size,
    id,
    payload,
  };
};

export default download;

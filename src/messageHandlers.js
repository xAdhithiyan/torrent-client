import buildMessage from './buildMessage.js';
import fs from 'fs';

const chokeHandler = (clientSocket) => {
  clientSocket.end();
};

const unchokeHandler = (clientSocket, pieces, queue) => {
  console.log('unchoked message reciieved');
  queue.changeChoked();
  //sometimes bitfield is sent before unchoke idk why
  requestPeice(clientSocket, pieces, queue);
};

const haveHandler = (clientSocket, pieces, queue, payload) => {
  const pieceIndex = payload.readUInt32BE(0);
  const queueEmpty = queue.length == 0;
  queue.queuing(pieceIndex);
  if (queueEmpty) {
    requestPeice(clientSocket, pieces, queue);
  }
};

// its an array of 8 bit characters from 0-7 then 8-15 etc
const bitfieldHandler = (clientSocket, pieces, queue, payload) => {
  console.log(payload);
  const queueEmpty = queue.length() == 0;
  payload.forEach((byte, i) => {
    if (byte % 2) {
      for (let j = 0; j < 8; j++) {
        if (byte % 2) {
          queue.queuing(i * 8 + 7 - j);
        }
        byte = Math.floor(byte / 2);
      }
    }
  });
  if (queueEmpty) {
    requestPeice(clientSocket, pieces, queue);
  }
};

const peiceHandler = (clientSocket, pieces, queue, payload, file, torrent) => {
  console.log('recieved');
  console.log('----');
  pieces.addRecieved(payload);

  const offset = payload.index * torrent.info['piece length'] + payload.begin;
  fs.write(file, payload.block, 0, payload.block.length, offset, () => {});

  if (pieces.isDone()) {
    clientSocket.end();
    console.log('finished downloading');
  } else {
    requestPeice(clientSocket, pieces, queue);
  }
};

const requestPeice = (clientSocket, pieces, queue) => {
  if (queue.checkChoked()) {
    console.log('queue empty');
    return null;
  }
  console.log(queue.length());
  while (queue.length()) {
    const pieceBlock = queue.dequing();
    if (pieces.needed(pieceBlock)) {
      clientSocket.write(buildMessage.buildRequest(pieceBlock));
      pieces.addRequested(pieceBlock);
      console.log(pieceBlock);
      console.log('requested');
      break;
    }
  }
};

const messageHandler = {
  chokeHandler,
  unchokeHandler,
  haveHandler,
  bitfieldHandler,
  peiceHandler,
};

export default messageHandler;

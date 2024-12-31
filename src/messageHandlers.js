const chokeHandler = (clientSocket) => {
  clientSocket.end();
};

const unchokeHandler = (clientSocket, pieces, queue) => {
  queue.choked = false;
  requestPeice(clientSocket, pieces, queue);
};

const haveHandler = (payload, queue, clientSocket) => {
  // const peiceIndex = payload.readUInt32BE(0);
  // queue.push(peiceIndex);

  // if (queue.length == 1) {
  //   requestPeice(queue, clientSocket);
  // }
  console.log('have ');
};

const bitfieldHandler = (payload) => {};

const PeiceHandler = (payload, queue, clientSocket) => {
  queue.shift();
  requestPeice(queue, clientSocket);
};

const requestPeice = (clientSocket, pieces, queue) => {
  if (queue.choked) {
    return null;
  }
  while (queue.queue.length) {
    const index = queue.queue.shift();
    if (pieces.needed(index)) {
      // do something
      break;
    }
  }
};

const messageHandler = {
  chokeHandler,
  unchokeHandler,
  haveHandler,
  bitfieldHandler,
  PeiceHandler,
};

export default messageHandler;

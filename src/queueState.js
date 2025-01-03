import { BLOCK_LEN, blockPerPiece, blockLen } from './torrentParser.js';

const queueState = (torrent) => {
  const torrentFile = torrent;
  const queue = [];
  let choked = true;

  // each piece is made of multiple blocks
  const queuing = (pieceIndex) => {
    const totalBlocks = blockPerPiece(torrentFile, pieceIndex);
    for (let i = 0; i < totalBlocks; i++) {
      // corresponds to the request payload
      const block = {
        index: pieceIndex,
        begin: i * BLOCK_LEN,
        length: blockLen(torrentFile, pieceIndex, i),
      };
      queue.push(block);
    }
  };

  const dequing = () => queue.shift();

  const peek = () => queue[0];

  const length = () => queue.length;

  const checkChoked = () => choked;

  const changeChoked = () => {
    choked = false;
  };

  return {
    queuing,
    dequing,
    peek,
    length,
    checkChoked,
    changeChoked,
  };
};

export default queueState;

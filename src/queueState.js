import { BLOCK_LEN, blockPerPiece, blockLen } from './torrentParser';

const queueState = (torrent) => {
  const torrentFile = torrent;
  const queue = [];
  // const choked = true;

  // each piece is made of multiple blocks
  const queuing = (pieceIndex) => {
    const totalBlocks = blockPerPiece(torrentFile, pieceIndex);
    for (let i = 0; i < totalBlocks; i++) {
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

  return {
    queuing,
    dequing,
    peek,
    length,
  };
};

export default queueState;

import { blockPerPiece, BLOCK_LEN } from './torrentParser.js';

const pieceState = (torrent) => {
  const buildPieceArray = () => {
    const totalPieces = torrent.info.pieces.length / 20;
    const arr = new Array(totalPieces).fill(null);
    return arr.map((i, index) =>
      new Array(blockPerPiece(torrent, index)).fill(false),
    );
  };

  let requested = buildPieceArray();
  const recieved = buildPieceArray();

  const addRequested = (pieceBlock) => {
    const blockIndex = pieceBlock.begin / BLOCK_LEN;
    requested[pieceBlock.index][blockIndex] = true;
  };

  const addRecieved = (pieceBlock) => {
    const blockIndex = pieceBlock.begin / BLOCK_LEN;
    recieved[pieceBlock.index][blockIndex] = true;
  };

  const needed = (pieceBlock) => {
    if (requested.every((block) => block.every((i) => i))) {
      requested = recieved.map((block) => block.slice());
    }

    const blockIndex = pieceBlock.begin / BLOCK_LEN;
    return !requested[pieceBlock.index][blockIndex];
  };

  const isDone = () => {
    return requested.every((block) => block.every((i) => i));
  };

  return {
    addRequested,
    addRecieved,
    needed,
    isDone,
  };
};

export default pieceState;

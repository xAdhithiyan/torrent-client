import fs from 'fs';
import bencode from 'bencode';
import crypto from 'crypto';
import path from 'path';
import bignum from 'bignum';

const BLOCK_LEN = Math.pow(2, 14);

const openTorrent = (file) => {
  return bencode.decode(fs.readFileSync(path.resolve(file)));
};

const openDestination = (path) => fs.openSync(path, 'w');

const infoHash = (torrent) => {
  const info = bencode.encode(torrent.info);
  return crypto.createHash('sha1').update(info).digest();
};

const torrentSize = (torrent) => {
  const totalSize = torrent.info.files
    ? torrent.info.files
        .map((file) => file.length)
        .reduce((acc, cur) => acc + cur)
    : torrent.info.length;

  return bignum.toBuffer(totalSize, { size: 8 });
};

const pieceLen = (torrent, pieceIndex) => {
  const totalLength = bignum.fromBuffer(torrentSize(torrent)).toNumber();
  const pieceLength = torrent.info['piece length'];

  const lastPieceLength = totalLength % pieceLength;
  const lastPieceIndex = Math.floor(totalLength / pieceLength);

  return lastPieceIndex == pieceIndex ? lastPieceLength : pieceLength;
};

const blockPerPiece = (torrent, pieceIndex) => {
  const pieceLength = pieceLen(torrent, pieceIndex);
  return Math.ceil(pieceLength / BLOCK_LEN);
};

const blockLen = (torrent, pieceIndex, blockIndex) => {
  const pieceLength = pieceLen(torrent, pieceIndex);

  const lastBlockLength = pieceLength % BLOCK_LEN;
  const lastBlockIndex = Math.floor(pieceLength / BLOCK_LEN);

  return blockIndex == lastBlockIndex ? lastBlockLength : BLOCK_LEN;
};

export {
  openTorrent,
  openDestination,
  infoHash,
  torrentSize,
  pieceLen,
  blockPerPiece,
  blockLen,
  BLOCK_LEN,
};

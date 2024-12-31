import { infoHash } from './torrentParser.js';
import generatePeerId from './util.js';

// https://wiki.theory.org/BitTorrentSpecification#Messages for these message formats
const handshake = (torrent) => {
  const msg = Buffer.alloc(68);

  msg.writeUInt8(19, 0);
  msg.write('BitTorrent protocol', 1);
  msg.writeUInt32BE(0, 20);
  msg.writeUInt32BE(0, 24);

  infoHash(torrent).copy(msg, 28);

  generatePeerId().copy(msg, 48);

  return msg;
};

const keepAlive = () => Buffer.alloc(4);

const generalForm = (num) => {
  const msg = Buffer.alloc(5);

  msg.writeUInt32BE(1, 0);
  msg.writeUInt8(num, 4);

  return msg;
};

// peer doesnt want to share data
const choke = () => generalForm(0);

const unchoke = () => generalForm(1);

// we are intrested in what data peer has
const intrested = () => generalForm(2);

const notIntrested = () => generalForm(3);

const buildHave = (payload) => {
  const msg = Buffer.alloc(9);

  msg.writeUInt32BE(5, 0);
  msg.writeUInt8(4, 4);

  msg.writeUInt32BE(payload, 5);
  return msg;
};

const buildBitfield = (payload) => {};

const buildRequest = (payload) => {
  const msg = Buffer.alloc(17);

  msg.writeUInt32BE(13, 0);
  msg.writeUInt8(6, 4);
  msg.writeUInt32BE(payload.index, 5);
  msg.writeUInt32BE(payload.begin, 9);
  msg.writeUInt32BE(payload.length, 13);

  return msg;
};

const buildPeice = (payload) => {
  const msg = Buffer.alloc(payload.block.length + 13);

  msg.writeUInt32BE(payload.block.length + 9, 0);
  msg.writeUint8(7, 4);
  msg.writeUInt32BE(payload.index, 5);
  msg.writeUInt32BE(payload.begin, 9);
  payload.block.copy(msg, 13);
};

const buildCancel = (payload) => {
  const msg = Buffer.alloc(17);

  msg.writeUInt32BE(13, 0);
  msg.writeUInt8(8, 4);
  msg.writeUInt32BE(payload.index, 5);
  msg.writeUInt32BE(payload.begin, 9);
  msg.writeUInt32BE(payload.length, 13);

  return msg;
};

const buildPort = (payload) => {
  const msg = Buffer.alloc(7);

  msg.writeUInt32BE(3, 0);
  msg.writeUInt8(9, 4);
  msg.writeUInt16BE(payload, 5);

  return msg;
};
const buildMessage = {
  handshake,
  keepAlive,
  choke,
  unchoke,
  intrested,
  notIntrested,
  buildHave,
  buildRequest,
  buildPeice,
  buildCancel,
  buildPort,
};

export default buildMessage;

import fs from 'fs';
import bencode from 'bencode';
import crypto from 'crypto';
import path from 'path';
import bignum from 'bignum';

const openTorrent = (file) => {
  return bencode.decode(fs.readFileSync(path.resolve(file)));
};

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

export { openTorrent, infoHash, torrentSize };

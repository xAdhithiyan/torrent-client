import fs from 'fs';
import bencode from 'bencode';

const torrent = bencode.decode(fs.readFileSync('puppy.torrent'));

const decodingTorrent = (bufferData) =>
  new TextDecoder('utf-8').decode(bufferData);

console.log(decodingTorrent(torrent.announce));

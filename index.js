import getPeers from './src/UdpTracker.js';
import { openTorrent } from './src/torrentParser.js';
import download from './src/TCPclient.js';
import pieceState from './src/pieceState.js';

import { pieceLen } from './src/torrentParser.js';
const torrent = openTorrent('./torrents/americanFiction.torrent');

const main = async () => {
  try {
    //const peers = await getPeers(torrent);
    //const pieces = pieceState(torrent.info.pieces.length / 20);
    //peers.forEach((peer) => download(peer, torrent, pieces));
    pieceLen(torrent, 19);
  } catch (err) {
    console.log(err);
  }
};

main();

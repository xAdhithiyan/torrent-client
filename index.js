import getPeers from './src/UdpTracker.js';
import { openTorrent, openDestination } from './src/torrentParser.js';
import download from './src/TCPclient.js';
import pieceState from './src/pieceState.js';

const DOWNLOAD_PATH = './downloaded/file';

const torrent = openTorrent('./torrents/americanFiction.torrent');

const main = async () => {
  try {
    const peers = await getPeers(torrent);
    const pieces = pieceState(torrent);

    const file = openDestination(DOWNLOAD_PATH);

    peers.forEach((peer) => download(peer, torrent, pieces, file));
  } catch (err) {
    console.log(err);
  }
};

main();

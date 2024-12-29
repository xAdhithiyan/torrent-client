import getPeers from './UdpTracker.js';
import { openTorrent } from './torrentParser.js';

const torrent = openTorrent('../torrents/americanFiction.torrent');
getPeers(torrent);

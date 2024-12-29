import crypto from 'crypto';

// peer id (an id for client) -> generated once bruh
let id = null;

const generatePeerId = () => {
  if (!id) {
    id = crypto.randomBytes(20);
    Buffer.from('-QT0001-').copy(id, 0);
  }

  return id;
};

export default generatePeerId;

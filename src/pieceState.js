const pieceState = (size) => {
  const requested = new Array(size).fill(false);
  const recieved = new Array(size).fill(false);

  const addRequested = (index) => {
    requested[index] = true;
  };

  const addRecieved = (index) => {
    recieved[index] = true;
  };

  const needed = (index) => {
    if (requested.every((i) => i == true)) {
      requested.length = 0;
      requested.push(...recieved);
    }
    return requested[index];
  };

  const isDone = () => {
    return recieved.every((i) => i == true);
  };

  return {
    addRequested,
    addRecieved,
    needed,
    isDone,
  };
};

export default pieceState;

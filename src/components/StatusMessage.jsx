const StatusMessage = ({ winner, gamingBoard, myTurn }) => {
  const { squares } = gamingBoard;
  const noMovesLeft = squares.every(square => square !== null);

  let message = null;

  if (winner) {
    message = (
      <>
        Winner is{' '}
        <span className={winner === 'X' ? 'text-green' : 'text-orange'}>
          {winner}
        </span>
      </>
    );
  } else if (noMovesLeft) {
    message = (
      <>
        <span className="text-orange">O</span> and{' '}
        <span className="text-green">X</span> tied
      </>
    );
  } else {
    message = (
      <span>{myTurn ? "It's your turn" : "Opponent's turn"}</span>
    );
  }

  return <h2 className="status-message">{message}</h2>;
};

export default StatusMessage;

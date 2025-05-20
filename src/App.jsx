import './styles.scss';
import { useEffect, useState } from 'react';
import Board from './components/Board';
import StatusMessage from './components/StatusMessage';
import History from './components/History';
import { calculateWinner } from './winner';
import socket from './socket';

const NEW_GAME = [{ squares: Array(9).fill(null), isXNext: true }];

function App() {
  const [history, setHistory] = useState(NEW_GAME);
  const [currentMove, setCurrentMove] = useState(0);
  const [symbol, setSymbol] = useState(null); // 'X' or 'O'
  const [room, setRoom] = useState(null);
  const [myTurn, setMyTurn] = useState(false);
  const [isGameReady, setIsGameReady] = useState(false);

  const gamingBoard = history[currentMove];
  const { winner, winningSquares } = calculateWinner(gamingBoard.squares);

  useEffect(() => {
    socket.on('startGame', ({ room, symbol: symbols }) => {
      const mySymbol = symbols[socket.id];
      setRoom(room);
      setSymbol(mySymbol);
      setMyTurn(mySymbol === 'X');
      setIsGameReady(true);
      setHistory(NEW_GAME);
      setCurrentMove(0);
    });

    socket.on('opponentMove', squares => {
      setHistory(prev => [...prev, { squares, isXNext: !gamingBoard.isXNext }]);
      setCurrentMove(move => move + 1);
      setMyTurn(true);
    });

    socket.on('gameReset', () => {
      setHistory(NEW_GAME);
      setCurrentMove(0);
      setMyTurn(symbol === 'X');
    });

    socket.on('opponentLeft', () => {
      alert('Opponent disconnected. Waiting for a new player...');
      setIsGameReady(false);
      setRoom(null);
      setSymbol(null);
      setHistory(NEW_GAME);
      setCurrentMove(0);
    });

    return () => {
      socket.off('startGame');
      socket.off('opponentMove');
      socket.off('gameReset');
      socket.off('opponentLeft');
    };
  }, [gamingBoard.isXNext, symbol]);

  const handleSquareClick = clickedPosition => {
    if (!isGameReady || !myTurn || winner || gamingBoard.squares[clickedPosition]) return;

    const nextSquaresState = gamingBoard.squares.map((value, idx) =>
      idx === clickedPosition ? symbol : value
    );

    const updatedHistory = [...history.slice(0, currentMove + 1), {
      squares: nextSquaresState,
      isXNext: symbol !== 'X',
    }];

    setHistory(updatedHistory);
    setCurrentMove(updatedHistory.length - 1);
    setMyTurn(false);

    socket.emit('makeMove', { room, squares: nextSquaresState });
  };

  const moveTo = move => {
    setCurrentMove(move);
  };

  const onNewGameStart = () => {
    setHistory(NEW_GAME);
    setCurrentMove(0);
    socket.emit('resetGame', room);
    setMyTurn(symbol === 'X');
  };

  return (
    <div className="app">
      <h1>
        TIC <span className="text-green">TAC</span> TOE
      </h1>

      {!isGameReady ? (
        <p className="status-message">Waiting for opponent to join...</p>
      ) : (
        <>
          <StatusMessage
            winner={winner}
            gamingBoard={gamingBoard}
            myTurn={myTurn}
            symbol={symbol}
          />
          <Board
            squares={gamingBoard.squares}
            handleSquareClick={handleSquareClick}
            winningSquares={winningSquares}
          />
          <button
            type="button"
            onClick={onNewGameStart}
            className={`btn-reset ${winner ? 'active' : ''}`}
          >
            Start new game
          </button>
          <h2 style={{ fontWeight: 'normal' }}>Current game history</h2>
          <History history={history} moveTo={moveTo} currentMove={currentMove} />
        </>
      )}
    </div>
  );
}

export default App;

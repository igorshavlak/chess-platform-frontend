import { Chess } from 'chess.js';


export const initialState = {
  status: 'loading',
  games: [],
  activeGameId: null,
  // Статистика ініціалізується нулями і буде розрахована після завантаження ігор
  stats: { wins: 0, losses: 0, draws: 0 }, 
  modal: {
    show: false,
    content: { title: '', message: '', outcome: '' },
  },
};

const calculateStatsFromGames = (gamesData, meId) => {
  return gamesData.reduce(
    (acc, game) => {
      // Ігри, що тривають, не мають winnerId. Завершені ігри мають.
      // Якщо winnerId є `undefined`, гра ще триває, і ми її ігноруємо.
      if (typeof game.winnerId === 'undefined') {
        return acc;
      }

      // Якщо winnerId === null, це нічия.
      if (game.winnerId === null) {
        acc.draws += 1;
      } 
      // Якщо winnerId збігається з нашим ID, це перемога.
      else if (String(game.winnerId) === meId) {
        acc.wins += 1;
      } 
      // В усіх інших випадках (winnerId є, але не наш), це поразка.
      else {
        acc.losses += 1;
      }
      return acc;
    },
    { wins: 0, losses: 0, draws: 0 }
  );
};


// Функція-хелпер createGameFromData не змінилася...
function createGameFromData(gameData, meId) {
    const chessInstance = new Chess();
    gameData.moves.forEach(m => chessInstance.move(m));

    let capturedByWhite = [];
    let capturedByBlack = [];
    const tempChessInstance = new Chess();
    gameData.moves.forEach(moveSan => {
        const result = tempChessInstance.move(moveSan);
        if (result && result.captured) {
        result.color === 'w'
            ? capturedByWhite.push(result.captured)
            : capturedByBlack.push(result.captured);
        }
    });

    return {
        gameId: gameData.gameId,
        fen: chessInstance.fen(),
        moves: gameData.moves,
        lastMove: gameData.moves.length > 0 ? chessInstance.history({ verbose: true }).slice(-1)[0] : null,
        whiteDeadline: gameData.whiteDeadline,
        blackDeadline: gameData.blackDeadline,
        whiteTime: Math.ceil(gameData.whiteTimeMillis / 1000),
        blackTime: Math.ceil(gameData.blackTimeMillis / 1000),
        increment: Math.ceil(gameData.incrementMillis / 1000) || 0,
        currentPlayer: chessInstance.turn(),
        gameMode: gameData.gameMode,
        timeControl: gameData.timeControl,
        gameStatus: 'Гра йде',
        localColor: meId === String(gameData.whitePlayerId) ? 'w' : 'b',
        capturedByWhite,
        capturedByBlack,
        players: {
        white: { name: gameData.whitePlayerName, rating: gameData.whitePlayerRating },
        black: { name: gameData.blackPlayerName, rating: gameData.blackPlayerRating },
        },
        chessInstance,
        viewedMoveIndex: null,
    };
}


export function simulReducer(state, action) {
  switch (action.type) {
    case 'GAMES_FETCHED': {
      const { gamesData, meId } = action.payload;
      const games = gamesData.map(game => createGameFromData(game, meId));
      return {
        ...state,
        status: 'ready',
        games,
        activeGameId: games.length > 0 ? games[0].gameId : null,
      };
    }

  case 'MOVE_HISTORY_BACK': {
      const { gameId } = action.payload;
      return {
        ...state,
        games: state.games.map(game => {
          if (game.gameId !== gameId) return game;

          const isLive = game.viewedMoveIndex === null;
          let newIndex;
          if (isLive) {
            newIndex = game.moves.length - 2;
          } else {
            newIndex = game.viewedMoveIndex - 1;
          }

          if (newIndex >= -1) {
            return { ...game, viewedMoveIndex: newIndex };
          }
          return game;
        }),
      };
    }

    // === NEW: Дія для руху вперед по історії ===
    case 'MOVE_HISTORY_FORWARD': {
      const { gameId } = action.payload;
      return {
        ...state,
        games: state.games.map(game => {
          if (game.gameId !== gameId) return game;

          const isLive = game.viewedMoveIndex === null;
          if (isLive) return game; // Вже в кінці, нічого не робити

          const newIndex = game.viewedMoveIndex + 1;
          if (newIndex >= game.moves.length - 1) {
            // Повернення в "живий" режим
            return { ...game, viewedMoveIndex: null };
          } else {
            return { ...game, viewedMoveIndex: newIndex };
          }
        }),
      };
    }


    // ... інші кейси без змін ...
    
    // ========================================================================
    // 🔥 ВИПРАВЛЕННЯ 1: ЛОГІКА ТАЙМЕРА
    // ========================================================================
    case 'UPDATE_TIMERS': {
      const now = Date.now();
      return {
        ...state,
        games: state.games.map(g => {
          if (g.gameStatus !== 'Гра йде') return g;

          let whiteSec = g.whiteTime;
          let blackSec = g.blackTime;

          // Зменшуємо час тільки для поточного гравця
          if (g.currentPlayer === 'w') {
            whiteSec = Math.max(0, Math.ceil((g.whiteDeadline - now) / 1000));
          } else {
            blackSec = Math.max(0, Math.ceil((g.blackDeadline - now) / 1000));
          }

          const isTimeUp = g.whiteTime === 0 || g.blackTime === 0;

          return {
            ...g,
            whiteTime: whiteSec,
            blackTime: blackSec,
            gameStatus: isTimeUp ? 'Час вийшов' : g.gameStatus,
          };
        }),
      };
    }

    // ========================================================================
    // 🔥 ВИПРАВЛЕННЯ 2: НОВА ДІЯ ДЛЯ ОБРОБКИ ХОДІВ З WEBSOCKET
    // ========================================================================
    case 'WEBSOCKET_MOVE_RECEIVED': {
      const rsp = action.payload;
      const gameToUpdate = state.games.find(g => g.gameId === rsp.gameId);

      // Якщо гру не знайдено або це наш власний хід, нічого не робимо
      if (!gameToUpdate) return state;

      const result = gameToUpdate.chessInstance.move(rsp.move);
      if (!result) return state; // Нелегальний хід від сервера

      const newGameState = {
        ...gameToUpdate,
        fen: gameToUpdate.chessInstance.fen(),
        moves: [...gameToUpdate.moves, result.san],
        lastMove: { from: result.from, to: result.to },
        currentPlayer: gameToUpdate.chessInstance.turn(),
        whiteDeadline: rsp.whiteDeadline,
        blackDeadline: rsp.blackDeadline,
        capturedByWhite: result.captured && result.color === 'w' ? [...gameToUpdate.capturedByWhite, result.captured] : gameToUpdate.capturedByWhite,
        capturedByBlack: result.captured && result.color === 'b' ? [...gameToUpdate.capturedByBlack, result.captured] : gameToUpdate.capturedByBlack,
      };

      return {
        ...state,
        games: state.games.map(g => (g.gameId === rsp.gameId ? newGameState : g)),
      };
    }
    
    // Код для UPDATE_GAME_STATE, GAME_CONCLUDED та інших залишається без змін...
    case 'SET_ACTIVE_GAME':
      return { ...state, activeGameId: action.payload };
    case 'UPDATE_GAME_STATE': {
        return {
          ...state,
          games: state.games.map(game =>
            game.gameId === action.payload.gameId
              ? { ...game, ...action.payload.updates, viewedMoveIndex: null } // Скидаємо індекс
              : game
          ),
        };
      }
   case 'GAME_CONCLUDED': {
    const { gameId, conclusion } = action.payload;
    let newGameStatus = 'Гра завершена';
    let outcome = '';
    let newStats = { ...state.stats };
    const game = state.games.find(g => g.gameId === gameId);
    if (!game) return state;

    const isPlayerWhite = game.localColor === 'w';

    // 🔥 ЗМІНЕНА ЛОГІКА: Явна перевірка на нічию
    // Припускаємо, що бекенд надсилає conclusion.whiteWinner === null для нічиєї
    if (conclusion.whiteWinner === null) {
        newGameStatus = 'Нічия';
        outcome = 'draw';
        newStats.draws += 1;
    } else if (conclusion.whiteWinner === true || conclusion.whiteWinner === false) {
        const didPlayerWin = (conclusion.whiteWinner && isPlayerWhite) || (!conclusion.whiteWinner && !isPlayerWhite);
        if (didPlayerWin) {
            newGameStatus = 'Ви виграли!';
            outcome = 'win';
            newStats.wins += 1;
        } else {
            newGameStatus = 'Ви програли.';
            outcome = 'loss';
            newStats.losses += 1;
        }
    } else {
        // Резервний варіант, якщо поле не прийшло
        console.error("Невизначений результат гри:", conclusion);
        newGameStatus = 'Нічия (невизначено)';
        outcome = 'draw';
        newStats.draws += 1;
    }

    // Збереження статистики в localStorage (якщо ви реалізували пункт 1)
    try {
        localStorage.setItem('simulStats', JSON.stringify(newStats));
    } catch (error) {
        console.error("Не вдалося зберегти статистику:", error);
    }

    return {
        ...state,
        stats: newStats,
        modal: { show: true, content: { title: newGameStatus, message: `Гра завершена. ${conclusion.reason || ''}`, outcome } },
        games: state.games.map(g => g.gameId === gameId ? { ...g, gameStatus: newGameStatus, outcome } : g),
    };
}

    case 'HIDE_MODAL':
      return { ...state, modal: { ...state.modal, show: false } };

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}
// ./workers/stockfishWorker.js
let stockfish = null;

// Функція для надсилання команд до Stockfish
function sendCommand(command) {
  if (stockfish) {
    stockfish.postMessage(command);
  }
}

// Обробник повідомлень від головного потоку
onmessage = function(e) {
  const { command, fen } = e.data;

  if (command === 'load') {
     // Завантажуємо рушій
     try {
        // Припускаємо, що stockfish.js ініціалізує глобальну змінну Stockfish
        // або надає функцію для її отримання
        stockfish = new Worker('/chess-demo/public/stockfish-17-lite.js'); // Шлях до вашого JS файлу рушія

        stockfish.onmessage = function(event) {
           // Пересилаємо всі повідомлення рушія назад до головного потоку
           postMessage({ type: 'stockfish_output', data: event.data });
        };

        stockfish.onerror = function(error) {
           postMessage({ type: 'stockfish_error', error: error.message });
        };

         postMessage({ type: 'stockfish_loaded' });

     } catch (error) {
        postMessage({ type: 'stockfish_error', error: error.message });
     }

  } else if (command === 'analyze') {
     if (!stockfish) {
         postMessage({ type: 'stockfish_error', error: 'Stockfish not loaded' });
         return;
     }
     // Зупиняємо поточний аналіз, якщо він є
     sendCommand('stop');
     sendCommand('ucinewgame');
     sendCommand('isready'); // Дочекатися готовності
     sendCommand(`position fen ${fen}`);
     // Починаємо аналіз. 'go depth 20' аналізує до глибини 20. Можна зробити глибину параметром.
     sendCommand('go depth 20');

  } else if (command === 'stop') {
     if (stockfish) {
        sendCommand('stop');
     }
  } else if (command === 'terminate') {
     if (stockfish) {
        stockfish.terminate();
        stockfish = null;
     }
  }
};
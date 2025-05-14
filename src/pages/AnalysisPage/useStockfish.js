// ./hooks/useStockfish.js
import { useState, useEffect, useRef, useCallback } from 'react';

function useStockfish() {
  const [evaluation, setEvaluation] = useState(null);
  const [pv, setPv] = useState('');
  const [thinking, setThinking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const workerRef = useRef(null);

  useEffect(() => {
    // 1) Створюємо воркер прямо зі Stockfish-скрипту
    // Покладіть stockfish-17-lite.js й stockfish-17-lite.wasm у public/
    const engine = new Worker('/stockfish.js');

    engine.onmessage = ({ data }) => {
      if (typeof data !== 'string') return;

      // Дочекаємось готовності рушія
      if (data === 'uciok') {
        // рушій перейшов у UCI-mode
        return;
      }
      if (data === 'readyok') {
        setLoading(false);
        return;
      }

      // Інформаційний рядок з аналізом
      if (data.startsWith('info depth')) {
        // приклад парсингу оцінки
        const scoreMatch = data.match(/score (cp|mate) (-?\d+)/);
        const pvMatch    = data.match(/ pv (.+)$/);

        if (scoreMatch) {
          const [, type, val] = scoreMatch;
          let evalValue = type === 'cp'
            ? parseInt(val, 10) / 100
            : (parseInt(val, 10) > 0 ? Infinity : -Infinity);
          setEvaluation(evalValue);
        }
        if (pvMatch) {
          setPv(pvMatch[1]);
        }
        setThinking(true);
        return;
      }

      // Коли рушій віддав фінальний «bestmove»
      if (data.startsWith('bestmove')) {
        setThinking(false);
        return;
      }
    };

    engine.onerror = e => {
      setError(new Error(e.message));
      setLoading(false);
    };

    // Ініціалізуємо UCI-інтерфейс рушія
    engine.postMessage('uci');
    engine.postMessage('isready');

    workerRef.current = engine;

    return () => {
      engine.terminate();
    };
  }, []);

  const analyzeFen = useCallback((fen) => {
    if (!workerRef.current || loading || error) return;
    setThinking(true);
    setEvaluation(null);
    setPv('');
    const w = workerRef.current;

    w.postMessage('stop');
    w.postMessage('ucinewgame');
    w.postMessage('isready');
    w.postMessage(`position fen ${fen}`);
    w.postMessage('go depth 20');
  }, [loading, error]);

  const stopAnalysis = useCallback(() => {
    if (workerRef.current && thinking) {
      workerRef.current.postMessage('stop');
      setThinking(false);
    }
  }, [thinking]);

  return {
    evaluation,
    pv,
    thinking,
    loading,
    error,
    analyzeFen,
    stopAnalysis,
  };
}

export default useStockfish;

// ./components/FENInput/FENInput.jsx
import React, { useState } from 'react';

function FENInput({ onLoadFEN }) {
   const [fen, setFen] = useState('');

   const handleSubmit = (e) => {
      e.preventDefault();
      onLoadFEN(fen);
   };

   return (
      <form onSubmit={handleSubmit}>
         <input
            type="text"
            value={fen}
            onChange={(e) => setFen(e.target.value)}
            placeholder="Вставте FEN тут..."
         />
         <button type="submit">Завантажити FEN</button>
      </form>
   );
}
export default FENInput;
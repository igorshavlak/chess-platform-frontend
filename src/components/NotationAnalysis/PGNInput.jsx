// ./components/PGNInput/PGNInput.jsx
import React, { useState } from 'react';

function PGNInput({ onLoadPGN }) {
   const [pgn, setPgn] = useState('');

   const handleSubmit = (e) => {
      e.preventDefault();
      onLoadPGN(pgn);
   };

   return (
      <form onSubmit={handleSubmit}>
         <textarea
            value={pgn}
            onChange={(e) => setPgn(e.target.value)}
            placeholder="Вставте PGN тут..."
            rows="5"
            cols="40"
         />
         <button type="submit">Завантажити PGN</button>
      </form>
   );
}
export default PGNInput;
const mockPuzzles = [
    {
        id: '0000D',
        fen: '5rk1/1p3ppp/pq3b2/8/8/1P1Q1N2/P4PPP/3R2K1 w - - 2 27',
        moves: ['d3d6', 'f8d8', 'd6d8', 'f6d8'], // W(d3d6), B(f8d8), W(d6d8), B(f6d8)
        rating: 1405,
        description: 'advantage endgame short',
        hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
        id: '0008Q',
        fen: '8/4R3/1p2P3/p4r2/P6p/1P3Pk1/4K3/8 w - - 1 64',
        moves: ['e7f7', 'f5e5', 'e2f1', 'e5e6'], // W(e7f7), B(f5e5), W(e2f1), B(e5e6)
        rating: 1257,
        description: 'advantage endgame rookEndgame short',
        hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
        id: '0009B',
        fen: 'r2qr1k1/b1p2ppp/pp4n1/P1P1p3/4P1n1/B2P2Pb/3NBP1P/RN1QR1K1 b - - 1 16',
        moves: ['b6c5', 'e2g4', 'h3g4', 'd1g4'], // B(b6c5), W(e2g4), B(h3g4), W(d1g4) - Тут перший хід чорних
        rating: 1080,
        description: 'advantage middlegame short',
        hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
     {
      id: '000VW',
      fen: 'r4r2/1p3pkp/p5p1/3R1N1Q/3P4/8/P1q2P2/3R2K1 b - - 3 25',
      moves: ['g6f5', 'd5c5', 'c2e4', 'h5g5', 'g7h8', 'g5f6'], // B(g6f5), W(d5c5), B(c2e4), W(h5g5), B(g7h8), W(g5f6)
      rating: 2844,
      description: 'crushing endgame long',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '000Vc',
      fen: '8/8/4k1p1/2KpP2p/5PP1/8/8/8 w - - 0 53',
      moves: ['g4h5', 'g6h5', 'f4f5', 'e6e5', 'f5f6', 'e5f6'], // W(g4h5), B(g6h5), W(f4f5), B(e6e5), W(f5f6), B(e5f6)
      rating: 1575,
      description: 'crushing endgame long pawnEndgame',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
     {
      id: '000Zo',
      fen: '4r3/1k6/pp3r2/1b2P2p/3R1p2/P1R2P2/1P4PP/6K1 w - - 0 35',
      moves: ['e5f6', 'e8e1', 'g1f2', 'e1f1'], // W(e5f6), B(e8e1), W(g1f2), B(e8f1)
      rating: 1353,
      description: 'endgame mate mateIn2 short',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '000aY',
      fen: 'r4rk1/pp3ppp/2n1b3/q1pp2B1/8/P1Q2NP1/1PP1PP1P/2KR3R w - - 0 15',
      moves: ['g5e7', 'a5c3', 'b2c3', 'c6e7'], // W(g5e7), B(a5c3), W(b2c3), B(c6e7)
      rating: 1440,
      description: 'advantage master middlegame short',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '000hf',
      fen: 'r1bqk2r/pp1nbNp1/2p1p2p/8/2BP4/1PN3P1/P3QP1P/3R1RK1 b kq - 0 19',
      moves: ['e8f7', 'e2e6', 'f7f8', 'e6f7'], // B(e8f7), W(e2e6), B(f7f8), W(e6f7)
      rating: 1483,
      description: 'mate mateIn2 middlegame short',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '000lC',
      fen: '3r3r/pQNk1ppp/1qnb1n2/1B6/8/8/PPP3PP/3R1R1K w - - 5 19',
      moves: ['d1d6', 'd7d6', 'b7b6', 'a7b6'], // W(d1d6), B(d7d6), W(b7b6), B(a7b6)
      rating: 1408,
      description: 'advantage hangingPiece middlegame short',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '000mr',
      fen: '5r1k/5rp1/p7/1b2B2p/1P1P1Pq1/2R1Q3/P3p1P1/2R3K1 w - - 0 41',
      moves: ['e3g3', 'f7f4', 'e5f4', 'f8f4'], // W(e3g3), B(f7f4), W(e5f4), B(f8f4)
      rating: 1941,
      description: 'crushing middlegame short',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '000qP',
      fen: '8/7R/8/5p2/4bk1P/8/2r2K2/6R1 w - - 7 51',
      moves: ['f2f1', 'f4f3', 'f1e1', 'c2c1', 'e1d2', 'c1g1'], // W(f2f1), B(f4f3), W(f1e1), B(c2c1), W(e1d2), B(c1g1)
      rating: 2094,
      description: 'crushing endgame exposedKing long skewer',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '000rO',
      fen: '3R4/8/K7/pB2b3/1p6/1P2k3/3p4/8 w - - 4 58',
      moves: ['a6a5', 'e5c7', 'a5b4', 'c7d8'], // W(a6a5), B(e5c7), W(a5b4), B(c7d8)
      rating: 1075,
      description: 'crushing endgame fork master short',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '000tp',
      fen: '4r3/5pk1/1p3np1/3p3p/2qQ4/P4N1P/1P3RP1/7K w - - 6 34',
      moves: ['d4b6', 'f6e4', 'h1g1', 'e4f2'], // W(d4b6), B(f6e4), W(h1g1), B(e4f2)
      rating: 2075,
      description: 'crushing endgame short trappedPiece',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '00143',
      fen: 'r2q1rk1/5ppp/1np5/p1b5/2p1B3/P7/1P3PPP/R1BQ1RK1 b - - 1 17',
      moves: ['d8f6', 'd1h5', 'h7h6', 'h5c5'], // B(d8f6), W(d1h5), B(h7h6), W(h5c5)
      rating: 1685,
      description: 'advantage middlegame short',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '0017R',
      fen: 'r2qk2r/pp2ppbp/1n1p2p1/3Pn3/2P5/2NBBP1P/PP3P2/R2QK2R b KQkq - 0 12',
      moves: ['e5c4', 'd3c4', 'b6c4', 'd1a4', 'd8d7', 'a4c4'], // B(e5c4), W(d3c4), B(b6c4), W(d1a4), B(d8d7), W(a4c4)
      rating: 1688,
      description: 'advantage fork long middlegame',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '0018S',
      fen: '2kr3r/pp3p2/4p2p/1N1p2p1/3Q4/1P1P4/2q2PPP/5RK1 b - - 1 20',
      moves: ['b7b6', 'd4a1', 'a7a5', 'f1c1'], // B(b7b6), W(d4a1), B(a7a5), W(f1c1)
      rating: 2630,
      description: 'advantage endgame pin short',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '001Fg',
      fen: '2R2r1k/pQ4pp/5rp1/3B4/q2n4/7P/P4PP1/5RK1 w - - 3 30',
      moves: ['c8c7', 'd4e2', 'g1h2', 'a4f4', 'h2h1', 'e2g3', 'f2g3', 'f4f1'], // W(c8c7), B(d4e2), W(g1h2), B(a4f4), W(h2h1), B(e2g3), W(f2g3), B(f4f1)
      rating: 1374,
      description: 'advantage middlegame veryLong',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '001Hi',
      fen: '6k1/pp1r1pp1/1qp1p2p/4P2P/5Q2/1P4R1/P1Pr1PP1/R5K1 b - - 4 23',
      moves: ['b6d4', 'f4f6', 'd4f2', 'f6f2', 'd2f2', 'g1f2'], // B(b6d4), W(f4f6), B(d4f2), W(f6f2), B(d2f2), W(g1f2)
      rating: 2389,
      description: 'advantage endgame long pin',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '001Wz',
      fen: '4r1k1/5ppp/r1p5/p1n1RP2/8/2P2N1P/2P3P1/3R2K1 b - - 0 21',
      moves: ['e8e5', 'd1d8', 'e5e8', 'd1e8'], // B(e8e5), W(d1d8), B(e5e8), W(d1e8)
      rating: 1125,
      description: 'backRankMate endgame mate mateIn2 short',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '001XA',
      fen: '1qr2rk1/pb2bppp/8/8/2p1N3/P1Bn2P1/2Q2PBP/1R3RK1 b - - 3 23',
      moves: ['b8c7', 'b1b7', 'c7b7', 'e4f6', 'e7f6', 'g2b7'], // B(b8c7), W(b1b7), B(c7b7), W(e4f6), B(e7f6), W(g2b7)
      rating: 1656,
      description: 'crushing discoveredAttack long master middlegame sacrifice',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '001aK',
      fen: '6k1/5p2/4p3/P1B5/2P4P/4Pnp1/Rb1rN3/5K2 b - - 1 33',
      moves: ['d2e2', 'f1e2', 'g3g2', 'e3e4', 'f3d4', 'e2f2'], // B(d2e2), W(f1e2), B(g3g2), W(e3e4), B(f3d4), W(e2f2)
      rating: 2042,
      description: 'crushing endgame hangingPiece long quietMove',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '001cr',
      fen: '8/3B2pp/p5k1/2p3P1/1p1p1K2/8/1P6/8 b - - 0 38',
      moves: ['c5c4', 'd7e8'], // B(c5c4), W(d7e8)
      rating: 1643,
      description: 'bishopEndgame endgame mate mateIn1 oneMove',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '001gi',
      fen: 'r6r/1pNk1ppp/2np4/b3p3/4P1b1/N1Q5/P4PPP/R3KB1R w KQ - 3 18',
      moves: ['c7a8', 'a5c3'], // W(c7a8), B(a5c3)
      rating: 822,
      description: 'bodenMate hangingPiece mate mateIn1 middlegame oneMove',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '001h8',
      fen: '2r3k1/2r4p/4p1p1/1p1q1pP1/p1bP1P1Q/P6R/5B2/2R3K1 b - - 5 34',
      moves: ['c4e2', 'h4h7', 'c7h7', 'c1c8', 'g8g7', 'c1c7'], // B(c4e2), W(h4h7), B(c7h7), W(c1c8), B(g8g7), W(c1c7) - typo c8c7
      rating: 1778,
      description: 'crushing deflection kingsideAttack long middlegame sacrifice',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '001m3',
      fen: '7r/6k1/2b1pp2/8/P1N3p1/5nP1/4RP2/Q4K2 w - - 2 38',
      moves: ['e2e6', 'h8h1', 'f1e2', 'h1a1'], // W(e2e6), B(h8h1), W(f1e2), B(h1a1)
      rating: 1482,
      description: 'advantage endgame short skewer',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '001om',
      fen: '5r1k/pp4pp/5p2/1BbQp1r1/6K1/7P/1PP3P1/3R3R w - - 2 26',
      moves: ['g4h4', 'c5f2', 'g2g3', 'f2g3'], // W(g4h4), B(c5f2), W(g2g3), B(f2g3)
      rating: 1018,
      description: 'mate mateIn2 middlegame short',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '001pC',
      fen: 'r4rk1/pp3ppp/3b4/2p1pPB1/7N/2PP3n/PP4PP/R2Q1RqK w - - 5 18',
      moves: ['f1g1', 'h3f2'], // W(f1g1), B(h3f2)
      rating: 859,
      description: 'mate mateIn1 middlegame oneMove smotheredMate',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '001u3',
      fen: '2r3k1/p1q2pp1/Q3p2p/b1Np4/2nP1P2/4P1P1/5K1P/2B1N3 b - - 3 33',
      moves: ['c7b6', 'a6c8', 'g8h7', 'c8b7'], // B(c7b6), W(a6c8), B(g8h7), W(c8b7)
      rating: 2175,
      description: 'advantage hangingPiece middlegame short',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '001uD',
      fen: '6k1/1p3pp1/1p5p/2r1p3/2n5/r3PN2/2RnNPPP/2R3K1 b - - 1 32',
      moves: ['f7f6', 'f3d2', 'c4d2', 'c2d2', 'c5c1', 'e2c1'], // B(f7f6), W(f3d2), B(c4d2), W(c2d2), B(c5c1), W(e2c1)
      rating: 1822,
      description: 'advantage long middlegame',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '001w5',
      fen: '1rb2rk1/q5P1/4p2p/3p3p/3P1P2/2P5/2QK3P/3R2R1 b - - 0 29',
      moves: ['f8f7', 'c2h7', 'g8h7', 'g7g8q'], // B(f8f7), W(c2h7), B(g8h7), W(g7g8q)
      rating: 1049,
      description: 'advancedPawn attraction mate mateIn2 middlegame promotion short',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '001wR',
      fen: '6nr/pp3p1p/k1p5/8/1QN5/2P1P3/4KPqP/8 b - - 5 26',
      moves: ['b7b5', 'b4a5', 'a6b7', 'c4d6', 'b7b8', 'a5d8'], // B(b7b5), W(b4a5), B(a6b7), W(c4d6), B(b7b8), W(a5d8)
      rating: 1230,
      description: 'endgame long mate mateIn3',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    },
    {
      id: '001wb',
      fen: 'r3k2r/pb1p1ppp/1b4q1/1Q2P3/8/2NP1Pn1/PP4PP/R1B2R1K w kq - 1 17',
      moves: ['h2g3', 'g6h5'], // W(h2g3), B(g6h5)
      rating: 1240,
      description: 'mate mateIn1 middlegame oneMove',
      hint: 'Підсвічена клітинка показує потрібну фігуру.'
    }
];
export default mockPuzzles;
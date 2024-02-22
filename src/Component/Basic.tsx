import React, { useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { useState } from "react";
import Chess, { KING, ShortMove, Square } from "chess.js";
import lodash from "lodash";

const Basic = () => {
  // @ts-ignore
  const [game, setGame] = useState(new Chess());
  const [optionSquares, setOptionSquares] = useState({});
  const [kingInCheck, setKingInCheck] = useState("");

  function makeAMove(move: string | ShortMove) {
    const gameCopy = { ...game };
    const result = gameCopy.move(move);
    setGame(gameCopy);
    // if (result) setGamePosition(gameCopy.fen());
    return result; // null if the move was illegal, the move object if the move was legal
  }

  function makeRandomMove() {
    const possibleMoves = game.moves();
    if (game.game_over() || game.in_draw() || possibleMoves.length === 0)
      console.log("Game over");
    console.log(game.game_over());
    return; // exit if the game is over
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    makeAMove(possibleMoves[randomIndex]);
  }

  function onDrop(sourceSquare: Square, targetSquare: Square) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // always promote to a queen for example simplicity
    });

    console.log("Move", move);

    // illegal move
    if (move === null) return false;
    // setTimeout(makeRandomMove, 200);
    return true;
  }

  const get_piece_positions = (game: any, piece: any) => {
    console.log("Game", game);
    console.log("Piece", piece);
    return []
      .concat(...game.board())
      .map((p: any, index) => {
        if (
          p !== null &&
          p?.type === piece?.type &&
          p?.color === piece?.color
        ) {
          return index;
        }
      })
      .filter(Number.isInteger)
      .map((piece_index: any) => {
        const row = "abcdefgh"[piece_index % 8];
        const column = Math.ceil((64 - piece_index) / 8);
        return row + column;
      });
  };

  useEffect(() => {
    // console.log("options ", optionSquares);
    console.log(kingInCheck);
  }, [kingInCheck]);

  /**
   * 
   * {
    "e3": {
        "background": "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        "borderRadius": "50%"
    },
    "e4": {
        "background": "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        "borderRadius": "50%"
    },
    "e2": {
        "background": "rgba(255, 255, 0, 0.4)"
    }
}
   */

  const handleCheckHighlight = (square: Square) => {
    return {
      [square]: {
        background:
          "radial-gradient(ellipse at center, rgb(255, 0, 0) 0%, rgb(231, 0, 0) 25%, rgba(169, 0, 0, 0) 89%, rgba(158, 0, 0, 0) 100%)",
        // borderRadius: "50%",
      },
    };
  };

  return (
    <div className="flex justify-center items-center h-screen w-full">
      <div className="w-[560px]">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          arePremovesAllowed
          customArrowColor="green"
          customSquareStyles={{
            ...(handleCheckHighlight(kingInCheck as Square) as any),
          }}
          getPositionObject={(position) => {
            // console.log("Position", position);
            const check = game.in_check();
            const turn = game.turn();
            if (check) {
              console.log("Check");
              const king: string[] = get_piece_positions(game, {
                type: "k",
                color: turn,
              });
              console.log("King", king);
              if (king.length) {
                setKingInCheck(king[0]);
              }
            }
            if (game.in_checkmate()) {
              alert("Checkmate");
            }
          }}
        />
      </div>
    </div>
  );
};

export default Basic;

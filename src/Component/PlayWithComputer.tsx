"use client";

import { useEffect, useMemo, useState } from "react";
import Engine from "../Stockfish/engine";
import Chess, { KING, Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import { PromotionPieceOption } from "react-chessboard/dist/chessboard/types";
import lodash from "lodash";

const PlayWithComputer = () => {
  const engine = useMemo(() => new Engine(), []);

  // @ts-ignore
  const [game, setGame] = useState(new Chess());
  // const game = useMemo(() => new Chess(), []);

  const [gamePosition, setGamePosition] = useState(game.fen());
  const [stockfishLevel, setStockfishLevel] = useState(2);
  const [moveFrom, setMoveFrom] = useState("");
  const [moveTo, setMoveTo] = useState<Square | null>(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [rightClickedSquares, setRightClickedSquares] = useState<any>({});
  const [moveSquares, setMoveSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});
  const [pgn, setPgn] = useState("");
  const [isCheck, setIsCheck] = useState(false);

  function findBestMove() {
    engine.evaluatePosition(game.fen(), stockfishLevel);
    // console.log(engine.evaluatePosition(game.fen(), stockfishLevel));

    engine.onMessage(({ bestMove }) => {
      console.log("Best move", bestMove);
      if (bestMove) {
        // In latest chess.js versions you can just write ```game.move(bestMove)```
        game.move({
          from: bestMove.substring(0, 2) as Square,
          to: bestMove.substring(2, 4) as Square,
          promotion:
            (bestMove.substring(4, 5) as "n" | "b" | "r" | "q" | undefined) ??
            "q",
        });
        // game.move(bestMove);

        setGamePosition(game.fen());
      }
    });
  }

  const addSound = (move: any) => {
    const audio = new Audio("/move-self.mp3");
    audio.play();
  };

  function onDrop(
    sourceSquare: Square,
    targetSquare: Square,
    piece: string | string[]
  ) {
    const move = game.move(
      {
        from: sourceSquare,
        to: targetSquare,
        promotion:
          (piece[1].toLowerCase() as "n" | "b" | "r" | "q" | undefined) ?? "q",
      },
      { vervose: true }
    );
    console.log("Move", move);
    addSound(move);
    setGamePosition(game.fen());
    setPgn(game.pgn());

    // illegal move
    if (move === null) return false;

    // exit if the game is over
    if (game.game_over() || game.in_draw()) return false;

    setTimeout(findBestMove, 2000);

    return true;
  }

  function getMoveOptions(square: Square) {
    const moves = game.moves({
      square,
      verbose: true,
    });
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares: any = {};
    moves.map((move: { to: string | number }) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) &&
          game.get(move.to).color !== game.get(square).color
            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
            : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
      return move;
    });
    newSquares[square] = {
      background: "rgba(255, 255, 0, 0.4)",
    };
    setOptionSquares(newSquares);
    return true;
  }

  function onSquareClick(square: Square) {
    setRightClickedSquares({});

    // from square
    if (!moveFrom) {
      const hasMoveOptions = getMoveOptions(square);
      if (hasMoveOptions) setMoveFrom(square);
      return;
    }

    // to square
    if (!moveTo) {
      // check if valid move before showing dialog
      const moves: any = game.moves({
        moveFrom,
        verbose: true,
      });
      const foundMove = moves.find(
        (m: any) => m.from === moveFrom && m.to === square
      );
      // not a valid move
      if (!foundMove) {
        // check if clicked on new piece
        const hasMoveOptions = getMoveOptions(square);
        // if new piece, setMoveFrom, otherwise clear moveFrom
        setMoveFrom(hasMoveOptions ? square : "");
        return;
      }

      // valid move
      setMoveTo(square);

      // if promotion move
      if (
        (foundMove.color === "w" &&
          foundMove.piece === "p" &&
          square[1] === "8") ||
        (foundMove.color === "b" &&
          foundMove.piece === "p" &&
          square[1] === "1")
      ) {
        setShowPromotionDialog(true);
        return;
      }

      // is normal move
      const gameCopy = { ...game };
      const move = game.move({
        from: moveFrom,
        to: square,
        promotion: "q",
      });

      // if invalid, setMoveFrom and getMoveOptions
      if (move === null) {
        const hasMoveOptions = getMoveOptions(square);
        if (hasMoveOptions) setMoveFrom(square);
        return;
      }

      // setGame(gameCopy);

      // setTimeout(makeRandomMove, 300);
      setMoveFrom("");
      setMoveTo(null);
      setOptionSquares({});
      return;
    }
  }

  function onPromotionPieceSelect(piece: PromotionPieceOption | undefined) {
    // if no piece passed then user has cancelled dialog, don't make move and reset
    if (piece) {
      const gameCopy = { ...game };
      game.move({
        from: moveFrom,
        to: moveTo,
        promotion: piece[1].toLowerCase() ?? "q",
      });
      // setGame(gameCopy);
      // setTimeout(makeRandomMove, 300);
    }

    setMoveFrom("");
    setMoveTo(null);
    setShowPromotionDialog(false);
    setOptionSquares({});
    return true;
  }

  function onSquareRightClick(square: Square) {
    console.log({ square });
    const colour = "rgba(0, 0, 255, 0.4)";
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] &&
        rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour },
    });
  }

  useEffect(() => {
    console.log({ rightClickedSquares });
    console.log({ optionSquares });
    console.log({ moveSquares });
  }, [rightClickedSquares]);

  // const addSoundwhileCapture = (move: any) => {
  //   const audio = new Audio("/capture.mp3");
  //   audio.play();
  // };

  // useEffect(() => {
  //   console.log("Game position", gamePosition);
  //   console.log("history", game.history());
  // }, [gamePosition]);

  // get the position of the king in check
  const get_piece_positions = (game: any, piece: any) => {
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

  return (
    <>
      <h1 className="text-center">Play vs Computer</h1>
      <Chessboard
        id="PlayVsStockfish"
        position={gamePosition}
        onPieceDrop={onDrop}
        // boardOrientation="white"
        arePiecesDraggable={true}
        arePremovesAllowed={true}
        clearPremovesOnRightClick={true}
        onSquareClick={onSquareClick}
        onSquareRightClick={onSquareRightClick}
        onPromotionPieceSelect={onPromotionPieceSelect}
        customBoardStyle={{
          borderRadius: "4px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        }}
        customSquareStyles={{
          ...moveSquares,
          ...optionSquares,
          ...rightClickedSquares,
        }}
        promotionToSquare={moveTo}
        showPromotionDialog={showPromotionDialog}
        getPositionObject={(position) => {
          console.log("Position", position);
          if (game.in_check()) {
            // console.log("Check");
            const turn = game.turn();
            console.log("Turn", turn);
            // const king = `${turn}k`;
            const king: string[] = get_piece_positions(game, {
              type: KING,
              color: turn,
            });
            const newObj: any = lodash.cloneDeep(optionSquares);
            newObj[king[0]] = {
              background:
                "radial-gradient(circle, rgba(255,0,0,.1) 85%, transparent 85%)",
              borderRadius: "50%",
            };
            console.log("King", king);
            setOptionSquares(newObj);

            // console.log("King", king);
          }
        }}
      />
    </>
  );
};

export default PlayWithComputer;

import { GeoJsonObject } from 'geojson';
import { LatLng } from 'leaflet';
import { useState } from 'react';
import {
  DailyChallenge,
  GameSettings,
  GameState,
  GameStatus,
} from '../types/jingle';
import { calculateTimeDifference } from '../utils/date-utils';

export interface Guess {
  correct: boolean;
  distance: number;
  guessedPosition: LatLng;
  correctPolygon: GeoJsonObject;
}

export default function useGameLogic(
  dailyChallenge: DailyChallenge,
  initialGameState?: GameState | null,
) {
  const [gameState, setGameState] = useState<GameState>(
    initialGameState ?? {
      status: GameStatus.Guessing,
      settings: {
        hardMode: false, // or whatever default value you want
        oldAudio: false,
      },
      round: 0,
      songs: dailyChallenge.songs,
      scores: [],
      startTime: Date.now(),
      timeTaken: null,
      guessedPosition: null,
      correctPolygon: null,
    },
  );

  const guess = (guess: Guess): GameState => {
    const score = Math.round(
      guess.correct ? 1000 : (1000 * 1) / Math.exp(0.0018 * guess.distance),
    );
    let newGameState = {
      ...gameState,
      status: GameStatus.AnswerRevealed,
      scores: [...gameState.scores, score],
      guessedPosition: guess.guessedPosition,
      correctPolygon: guess.correctPolygon,
    };
    setGameState(newGameState);

    const isLastRound = gameState.round === gameState.songs.length - 1;
    if (isLastRound) {
      newGameState = {
        ...newGameState,
        timeTaken: calculateTimeDifference(gameState.startTime, Date.now()),
      };
      setGameState(newGameState);
    }

    return newGameState;
  };

  const nextSong = (): GameState => {
    const newGameState = {
      ...gameState,
      round: gameState.round + 1,
      status: GameStatus.Guessing,
    };
    setGameState(newGameState);
    return newGameState;
  };

  const endGame = (): GameState => {
    if (
      !(
        gameState.status === GameStatus.AnswerRevealed &&
        gameState.round === gameState.songs.length - 1
      )
    ) {
      throw new Error('Game is not over yet');
    }

    const newGameState = {
      ...gameState,
      status: GameStatus.GameOver,
    };
    setGameState(newGameState);
    return newGameState;
  };

  const updateGameSettings = (newSettings: GameSettings) => {
    setGameState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...newSettings,
      },
    }));
  };

  return { gameState, guess, nextSong, endGame, updateGameSettings };
}

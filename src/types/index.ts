export interface GameState {
  gameId: string;
  board: Array<Array<string>>;
  currentTurn: string;
  player1: string;
  player2: string;
  status: GameStatus;
  winner?: string;
  playerNames: { [key: string]: string };
  createdAt: Date;
  updatedAt: Date;
}

export enum GameStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  FINISHED = 'finished'
}

export interface PlayerMove {
  gameId: string;
  playerId: string;
  position: {
    row: number;
    col: number;
  };
}

export interface ServerToClientEvents {
  game_update: (data: GameState) => void;
  game_created: (data: { gameId: string }) => void;
  game_joined: (data: GameState) => void;
  game_over: (data: { winner?: string, gameState: GameState }) => void;
  player_left: (data: { playerId: string }) => void;
  error: (data: { message: string, code: string }) => void;
  move_error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  create_game: (data: { playerName: string }) => void;
  join_game: (data: { gameId: string, playerName: string }) => void;
  make_move: (data: PlayerMove) => void;
  cancel_game: (data: { gameId: string }) => void;
  leave_game: (data: { gameId: string }) => void;
  disconnect_game: () => void;
}

export interface Player {
  id: string;
  name: string;
  gameId?: string;
  symbol?: 'X' | 'O';
}

export interface Game {
  id: string;
  board: string[][];
  players: {
    [key: string]: Player;
  };
  currentTurn?: string;
  status: GameStatus;
  winner?: string;
  createdAt: Date;
  updatedAt: Date;
}

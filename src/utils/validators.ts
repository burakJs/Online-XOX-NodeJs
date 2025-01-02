import { Game, PlayerMove } from '../types';

export const isValidMove = (move: PlayerMove, game: Game): boolean => {
  // Check if it's the player's turn
  if (game.currentTurn !== move.playerId) {
    return false;
  }

  // Check if position is within bounds
  if (move.position.row < 0 || move.position.row > 2 || 
      move.position.col < 0 || move.position.col > 2) {
    return false;
  }

  // Check if position is empty
  if (game.board[move.position.row][move.position.col] !== '') {
    return false;
  }

  return true;
};

export const checkWinner = (board: string[][]): string | null => {
  // Check rows
  for (let i = 0; i < 3; i++) {
    if (board[i][0] !== '' && 
        board[i][0] === board[i][1] && 
        board[i][1] === board[i][2]) {
      return board[i][0];
    }
  }

  // Check columns
  for (let i = 0; i < 3; i++) {
    if (board[0][i] !== '' && 
        board[0][i] === board[1][i] && 
        board[1][i] === board[2][i]) {
      return board[0][i];
    }
  }

  // Check diagonals
  if (board[0][0] !== '' && 
      board[0][0] === board[1][1] && 
      board[1][1] === board[2][2]) {
    return board[0][0];
  }

  if (board[0][2] !== '' && 
      board[0][2] === board[1][1] && 
      board[1][1] === board[2][0]) {
    return board[0][2];
  }

  return null;
};

export const isBoardFull = (board: string[][]): boolean => {
  return board.every(row => row.every(cell => cell !== ''));
};

export const createEmptyBoard = (): string[][] => {
  return Array(3).fill(null).map(() => Array(3).fill(''));
};

import { v4 as uuidv4 } from 'uuid';
import { Game as GameType, GameStatus, Player, PlayerMove } from '../types';
import { createEmptyBoard, isValidMove, checkWinner, isBoardFull } from '../utils/validators';
import logger from '../utils/logger';

export class Game implements GameType {
  public id: string;
  public board: string[][];
  public players: { [key: string]: Player };
  public currentTurn?: string;
  public status: GameStatus;
  public winner?: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor() {
    this.id = uuidv4();
    this.board = createEmptyBoard();
    this.players = {};
    this.status = GameStatus.WAITING;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public addPlayer(player: Player): boolean {
    if (Object.keys(this.players).length >= 2) {
      return false;
    }

    this.players[player.id] = {
      ...player,
      gameId: this.id,
      symbol: Object.keys(this.players).length === 0 ? 'X' : 'O'
    };

    if (Object.keys(this.players).length === 2) {
      this.status = GameStatus.PLAYING;
      this.currentTurn = Object.keys(this.players)[0];
    }

    this.updatedAt = new Date();
    return true;
  }

  public makeMove(move: PlayerMove): boolean {
    if (!isValidMove(move, this)) {
      return false;
    }

    const player = this.players[move.playerId];
    this.board[move.position.row][move.position.col] = player.symbol!;
    
    const winner = checkWinner(this.board);
    if (winner) {
      this.status = GameStatus.FINISHED;
      this.winner = move.playerId;
    } else if (isBoardFull(this.board)) {
      this.status = GameStatus.FINISHED;
    } else {
      // Switch turns
      const playerIds = Object.keys(this.players);
      this.currentTurn = playerIds.find(id => id !== move.playerId);
    }

    this.updatedAt = new Date();
    return true;
  }

  public removePlayer(playerId: string): void {
    if (this.players[playerId]) {
      delete this.players[playerId];
      if (this.status === GameStatus.PLAYING) {
        this.status = GameStatus.FINISHED;
        // Set other player as winner
        const remainingPlayer = Object.keys(this.players)[0];
        if (remainingPlayer) {
          this.winner = remainingPlayer;
        }
      }
      this.updatedAt = new Date();
    }
  }

  public toGameState() {
    const playerIds = Object.keys(this.players);
    return {
      gameId: this.id,
      board: this.board,
      currentTurn: this.currentTurn || '',
      player1: playerIds[0] || '',
      player2: playerIds[1] || '',
      status: this.status,
      winner: this.winner,
      playerNames: Object.entries(this.players).reduce((acc, [id, player]) => {
        acc[id] = player.name;
        return acc;
      }, {} as { [key: string]: string }),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

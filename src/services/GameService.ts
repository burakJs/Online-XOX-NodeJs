import { Game } from '../models/Game';
import { Player } from '../models/Player';
import { PlayerMove, GameState } from '../types';
import logger from '../utils/logger';

export class GameService {
  private games: Map<string, Game>;
  private players: Map<string, Player>;

  constructor() {
    this.games = new Map();
    this.players = new Map();
  }

  public createGame(playerName: string): { gameId: string; playerId: string } {
    const player = new Player(playerName);
    const game = new Game();

    game.addPlayer(player);
    
    this.games.set(game.id, game);
    this.players.set(player.id, player);

    logger.info(`Game created: ${game.id} by player: ${player.id}`);
    return { gameId: game.id, playerId: player.id };
  }

  public joinGame(gameId: string, playerName: string): { playerId: string; gameState: GameState } | null {
    const game = this.games.get(gameId);
    if (!game) {
      logger.error(`Game not found: ${gameId}`);
      return null;
    }

    const player = new Player(playerName);
    if (!game.addPlayer(player)) {
      logger.error(`Cannot join game ${gameId}: game is full`);
      return null;
    }

    this.players.set(player.id, player);
    logger.info(`Player ${player.id} joined game ${gameId}`);
    
    return {
      playerId: player.id,
      gameState: game.toGameState()
    };
  }

  public makeMove(move: PlayerMove): GameState | null {
    const game = this.games.get(move.gameId);
    if (!game) {
      logger.error(`Game not found: ${move.gameId}`);
      return null;
    }

    if (!game.makeMove(move)) {
      logger.error(`Invalid move by player ${move.playerId} in game ${move.gameId}`);
      return null;
    }

    logger.info(`Move made in game ${move.gameId} by player ${move.playerId}`);
    return game.toGameState();
  }

  public removePlayer(playerId: string): void {
    const player = this.players.get(playerId);
    if (player && player.gameId) {
      const game = this.games.get(player.gameId);
      if (game) {
        game.removePlayer(playerId);
        if (Object.keys(game.players).length === 0) {
          this.games.delete(game.id);
          logger.info(`Game ${game.id} removed as all players left`);
        }
      }
      this.players.delete(playerId);
      logger.info(`Player ${playerId} removed`);
    }
  }

  public getGame(gameId: string): Game | undefined {
    return this.games.get(gameId);
  }

  public getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  public cleanupGame(gameId: string): void {
    const game = this.games.get(gameId);
    if (game) {
      Object.keys(game.players).forEach(playerId => {
        this.players.delete(playerId);
      });
      this.games.delete(gameId);
      logger.info(`Game ${gameId} cleaned up`);
    }
  }
}

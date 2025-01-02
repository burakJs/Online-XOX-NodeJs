import { Server, Socket } from 'socket.io';
import { GameService } from './GameService';
import { ClientToServerEvents, ServerToClientEvents } from '../types';
import logger from '../utils/logger';

export class SocketService {
  private io: Server;
  private gameService: GameService;

  constructor(io: Server) {
    this.io = io;
    this.gameService = new GameService();
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      logger.info(`Client connected: ${socket.id}`);

      socket.on('create_game', (data) => this.handleCreateGame(socket, data));
      socket.on('join_game', (data) => this.handleJoinGame(socket, data));
      socket.on('make_move', (data) => this.handleMakeMove(socket, data));
      socket.on('cancel_game', (data) => this.handleCancelGame(socket, data));
      socket.on('leave_game', (data) => this.handleLeaveGame(socket, data));
      socket.on('disconnect_game', () => this.handleDisconnect(socket));
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  private handleCreateGame(socket: Socket, data: { playerName: string }): void {
    try {
      const result = this.gameService.createGame(data.playerName);
      socket.join(result.gameId);
      socket.data.playerId = result.playerId;
      socket.data.gameId = result.gameId;
      
      socket.emit('game_created', { gameId: result.gameId });
      
      logger.info(`Game created: ${result.gameId} by player: ${result.playerId}`);
    } catch (error) {
      logger.error('Error creating game:', error);
      socket.emit('error', { message: 'Failed to create game', code: 'CREATE_GAME_ERROR' });
    }
  }

  private handleJoinGame(socket: Socket, data: { gameId: string; playerName: string }): void {
    try {
      const result = this.gameService.joinGame(data.gameId, data.playerName);
      if (!result) {
        socket.emit('error', { message: 'Game not found or full', code: 'JOIN_GAME_ERROR' });
        return;
      }

      socket.join(data.gameId);
      socket.data.playerId = result.playerId;
      socket.data.gameId = data.gameId;

      // Notify all players in the game
      this.io.to(data.gameId).emit('game_joined', result.gameState);
      
      logger.info(`Player ${result.playerId} joined game ${data.gameId}`);
    } catch (error) {
      logger.error('Error joining game:', error);
      socket.emit('error', { message: 'Failed to join game', code: 'JOIN_GAME_ERROR' });
    }
  }

  private handleMakeMove(socket: Socket, data: { gameId: string; position: { row: number; col: number } }): void {
    try {
      const playerId = socket.data.playerId;
      if (!playerId) {
        socket.emit('error', { message: 'Player not found', code: 'INVALID_PLAYER' });
        return;
      }

      const move = {
        gameId: data.gameId,
        playerId,
        position: data.position
      };

      const gameState = this.gameService.makeMove(move);
      if (!gameState) {
        socket.emit('move_error', { message: 'Invalid move' });
        return;
      }

      if (gameState.status === 'finished') {
        this.io.to(data.gameId).emit('game_over', { 
          winner: gameState.winner,
          gameState 
        });
        // Cleanup game after delay
        setTimeout(() => {
          this.gameService.cleanupGame(data.gameId);
        }, 5000);
      } else {
        this.io.to(data.gameId).emit('game_update', gameState);
      }
    } catch (error) {
      logger.error('Error making move:', error);
      socket.emit('error', { message: 'Failed to make move', code: 'MOVE_ERROR' });
    }
  }

  private handleCancelGame(socket: Socket, data: { gameId: string }): void {
    try {
      const playerId = socket.data.playerId;
      if (!playerId) {
        socket.emit('error', { message: 'Player not found', code: 'INVALID_PLAYER' });
        return;
      }

      this.io.to(data.gameId).emit('game_over', {
        gameState: this.gameService.getGame(data.gameId)?.toGameState()!
      });
      
      this.gameService.cleanupGame(data.gameId);
      socket.leave(data.gameId);
      
      logger.info(`Game ${data.gameId} cancelled by player ${playerId}`);
    } catch (error) {
      logger.error('Error cancelling game:', error);
      socket.emit('error', { message: 'Failed to cancel game', code: 'CANCEL_GAME_ERROR' });
    }
  }

  private handleLeaveGame(socket: Socket, data: { gameId: string }): void {
    try {
      const playerId = socket.data.playerId;
      if (playerId) {
        this.gameService.removePlayer(playerId);
        this.io.to(data.gameId).emit('player_left', { playerId });
        socket.leave(data.gameId);
        
        const game = this.gameService.getGame(data.gameId);
        if (game) {
          this.io.to(data.gameId).emit('game_update', game.toGameState());
        }
      }
    } catch (error) {
      logger.error('Error leaving game:', error);
      socket.emit('error', { message: 'Failed to leave game', code: 'LEAVE_GAME_ERROR' });
    }
  }

  private handleDisconnect(socket: Socket): void {
    try {
      const playerId = socket.data.playerId;
      const gameId = socket.data.gameId;
      
      if (playerId && gameId) {
        this.gameService.removePlayer(playerId);
        this.io.to(gameId).emit('player_left', { playerId });
        
        const game = this.gameService.getGame(gameId);
        if (game) {
          this.io.to(gameId).emit('game_update', game.toGameState());
        }
      }
      
      logger.info(`Client disconnected: ${socket.id}`);
    } catch (error) {
      logger.error('Error handling disconnect:', error);
    }
  }
}

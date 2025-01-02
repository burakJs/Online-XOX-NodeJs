import { v4 as uuidv4 } from 'uuid';
import { Player as PlayerType } from '../types';

export class Player implements PlayerType {
  public id: string;
  public name: string;
  public gameId?: string;
  public symbol?: 'X' | 'O';

  constructor(name: string) {
    this.id = uuidv4();
    this.name = name;
  }

  public setGame(gameId: string): void {
    this.gameId = gameId;
  }

  public setSymbol(symbol: 'X' | 'O'): void {
    this.symbol = symbol;
  }

  public reset(): void {
    this.gameId = undefined;
    this.symbol = undefined;
  }
}

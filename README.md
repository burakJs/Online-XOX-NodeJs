# Online XOX Game Backend

## Product Requirements Document (PRD)

### Overview
This is the backend service for an online Tic-tac-toe (XOX) game implemented using Node.js and Socket.IO, designed to work with a Flutter mobile frontend. The service enables real-time multiplayer gameplay, matchmaking, and game state management with emphasis on mobile-specific requirements.

### Technical Stack
- **Backend:**
  - Node.js
  - Express.js
  - Socket.IO (WebSocket implementation)
- **Frontend:**
  - Flutter (Mobile UI framework)
- **Dependencies:**
  - express (Web framework)
  - socket.io (WebSocket implementation)
  - uuid (Unique ID generation)
  - winston (Logging)

### Core Features

#### 1. Game Management
- Create new game sessions with unique IDs for invitations
- Join existing game sessions using game IDs
- Handle game state updates and move validation
- Check win conditions
- Automatic game cleanup after completion
- Memory-only storage (no persistent database)

#### 2. Player Management
- Handle player connections and disconnections gracefully
- Support for game cancellation
- Handle app closure/background states
- Proper cleanup of abandoned games
- Reconnection support for temporary disconnections

#### 3. WebSocket Features
- Real-time game updates and board synchronization
- Move validation and error reporting
- Game state broadcasts
- Connection health monitoring
- Socket room management with cleanup

#### 4. Game Flow Control
- Validate all moves server-side
- Send error messages for invalid moves
- Track and broadcast game status changes
- Determine and announce winner
- Enable new game creation after completion
- Automatic resource cleanup

### API Endpoints

#### WebSocket Events
```typescript
interface ServerToClientEvents {
  game_update: (data: GameState) => void;
  game_created: (data: { gameId: string }) => void;
  game_joined: (data: GameState) => void;
  game_over: (data: { winner?: string, gameState: GameState }) => void;
  player_left: (data: { playerId: string }) => void;
  error: (data: { message: string, code: string }) => void;
  move_error: (data: { message: string }) => void;
}

interface ClientToServerEvents {
  create_game: (data: { playerName: string }) => void;
  join_game: (data: { gameId: string, playerName: string }) => void;
  make_move: (data: PlayerMove) => void;
  cancel_game: (data: { gameId: string }) => void;
  leave_game: (data: { gameId: string }) => void;
  disconnect_game: () => void;
}
```

#### HTTP Endpoints
- `POST /api/game/create`: Create a new game session
- `POST /api/game/join/:gameId`: Join an existing game
- `GET /api/game/:gameId`: Get game status

### Data Structures

#### Game State
```typescript
interface GameState {
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

enum GameStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  FINISHED = 'finished'
}
```

#### Player Move
```typescript
interface PlayerMove {
  gameId: string;
  playerId: string;
  position: {
    row: number;
    col: number;
  };
}
```

### Game Rules
1. Two players take turns marking spaces on a 3x3 grid
2. First player uses "X", second player uses "O"
3. Game ends when:
   - One player gets three marks in a row (horizontal, vertical, or diagonal)
   - Board is full (draw)
   - Player disconnects (opponent wins)
   - Player cancels the game
   - App is closed or put in background for extended period

### Error Handling
- Invalid moves with specific error messages
- Connection issues and reconnection logic
- Game session cleanup
- Player timeout and disconnection
- App state changes (background/foreground)
- Invalid game ID handling
- Duplicate join attempts

### Mobile-Specific Considerations
1. Handle app lifecycle states:
   - App in background
   - App termination
   - Network changes
2. Efficient socket reconnection
3. UI state synchronization
4. Error message localization support
5. Optimized data transfer for mobile networks

### Performance Requirements
- Support multiple concurrent games
- Low latency for real-time updates
- Efficient game state management
- Graceful handling of disconnections

### Project Structure
```
backend/
├── src/
│   ├── config/
│   │   └── index.ts
│   ├── models/
│   │   ├── Game.ts
│   │   └── Player.ts
│   ├── services/
│   │   ├── GameService.ts
│   │   └── SocketService.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── validators.ts
│   └── app.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Development Setup
1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

4. For production:
```bash
npm run build
npm start
```

### Scripts
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "lint": "eslint . --ext .ts",
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

### Testing with Flutter Client
1. Ensure backend is running
2. Update Flutter client with correct WebSocket URL
3. Test all game scenarios:
   - Game creation
   - Game joining
   - Move making
   - Error handling
   - Disconnection handling
   - Game completion
   - New game after completion

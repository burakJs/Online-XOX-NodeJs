# Online XOX Game - Backend Service 🎮

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?logo=express)](https://expressjs.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?logo=socket.io)](https://socket.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Real-time multiplayer Tic-tac-toe game server built with Node.js and Socket.IO. Designed to work seamlessly with the Flutter mobile client.

## ✨ Features

- 🎮 Real-time multiplayer gameplay
- 🔄 WebSocket-based communication
- 🎯 Game session management
- 🛡️ Move validation
- 🔌 Reconnection support
- 🧹 Automatic cleanup

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **WebSocket:** Socket.IO
- **Language:** TypeScript
- **Logging:** Winston
- **Utils:** UUID

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/        # Configuration
│   ├── models/        # Data models
│   ├── services/      # Business logic
│   ├── types/         # TypeScript types
│   ├── utils/         # Utilities
│   └── app.ts         # App entry
├── package.json
└── tsconfig.json
```

## 🚀 Getting Started

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

3. **Development**
   ```bash
   npm run dev
   ```

4. **Production**
   ```bash
   npm run build
   npm start
   ```

## 📡 WebSocket Events

### Server to Client
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
```

### Client to Server
```typescript
interface ClientToServerEvents {
  create_game: (data: { playerName: string }) => void;
  join_game: (data: { gameId: string, playerName: string }) => void;
  make_move: (data: PlayerMove) => void;
  cancel_game: (data: { gameId: string }) => void;
  leave_game: (data: { gameId: string }) => void;
  disconnect_game: () => void;
}
```

## 🎯 Game Rules

1. Two players take turns (X and O)
2. First to get 3 in a row wins
3. Game ends on:
   - Win condition met
   - Board full (draw)
   - Player disconnection
   - Game cancellation

## 📱 Mobile Support

- App lifecycle handling
- Efficient reconnection
- Network state management
- Background state handling

## 🔧 Available Scripts

```json
{
  "dev": "ts-node-dev --respawn src/app.ts",
  "build": "tsc",
  "start": "node dist/app.js",
  "lint": "eslint . --ext .ts",
  "format": "prettier --write \"src/**/*.ts\""
}
```

## 🧪 Testing

To test with Flutter client:

1. Start the backend server
2. Configure client WebSocket URL
3. Test scenarios:
   - Game creation/joining
   - Move validation
   - Disconnection handling
   - Game completion

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

# AI Genesis 3D

A small simulation of agents that get hungry, search for food, and reproduce. The backend advances the world on a tick loop and streams it over Socket.io. The frontend renders that world in Three.js.

```
ai-genesis-3d/
├── backend/
│   └── src/
│       ├── simulation/    Tick loop, needs, reproduction
│       ├── models/        Agent and world state
│       └── server.js      Express and Socket.io
└── frontend/
    └── src/
        ├── components/    Three.js canvas and HUD
        ├── hooks/         WebSocket connection
        └── App.jsx
```

## Requirements

- Node.js 20 or newer

## Run

```bash
npm install
npm run dev
```

- Simulation server: http://localhost:3001
- Viewer: http://localhost:5173

Pause, resume, and reset are in the HUD. Reset rebuilds the colony on the server.

## How a tick works

Each tick, every living agent:

1. Gains hunger and spends a little energy.
2. Wanders until hunger crosses a threshold, then walks toward a nearby food source.
3. Eats when it reaches food, which lowers hunger and restores energy.
4. Dies if hunger maxes out or energy hits zero.
5. May reproduce when it is old enough, well fed, and the colony is under the population cap.

Food reappears over time. Color shifts slightly with each generation.

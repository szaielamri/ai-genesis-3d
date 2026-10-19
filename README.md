# AI Genesis

A 3D artificial life simulation. Agents get hungry, rest, seek company, study the land, raise buildings, and have children. The backend advances the world once per second and streams it over Socket.io. The frontend renders that world in Three.js.

At 1x, one tick is one second and a quarter of a year. Adulthood is age 18. Time scale can run at 2x or 5x.

## Layout

```
shared/     Agent, DNA, world, and terrain types
backend/    Tick loop, genetics, tech tree, SQLite, Socket.io
frontend/   React, Tailwind, react-three-fiber dashboard
```

## Requirements

- Node.js 22 or newer (the server stores the world with Node's built-in SQLite)

## Run

```bash
npm install
npm run dev
```

- World view: http://localhost:5173
- Simulation API: http://localhost:3001/health

Drag to orbit, scroll to zoom, and click an agent to follow them and open the inspector. Pause, 1x / 2x / 5x, and reset sit at the bottom of the screen.

The live world is saved to `backend/data/genesis.sqlite` and restored on the next launch.

## Rules

- Hunger falls over time. Below 20, health falls with it.
- Energy falls while moving and returns while resting.
- Social falls when an agent is isolated, and rises when they reach someone.
- Two adults of opposite sex, close together, with social and health above 70, can reproduce. The child inherits DNA by single-point crossover plus a 5% drift, and the generation is one past the older parent.
- Curious agents gather research at obelisks. The society moves through Primitive, Agricultural, Metallurgy, Industrial, and the Digital Era. Those eras unlock huts, farms, workshops, and research hubs.
